// CrashDetectionService.kt
package com.retyrn

import android.app.*
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.disposables.CompositeDisposable
import io.reactivex.rxjava3.schedulers.Schedulers
import io.reactivex.rxjava3.subjects.PublishSubject
import java.util.concurrent.TimeUnit

class CrashDetectionService : Service(), SensorEventListener {

  private val channelId = "CrashDetectionServiceChannel"
  private lateinit var sensorManager: SensorManager
  private var accelerometer: Sensor? = null
  private val compositeDisposable = CompositeDisposable()
  private val sensorEventSubject = PublishSubject.create<SensorEvent>()
  private var lastCrashTime: Long = 0
  private val crashCooldownTime = 10000

  override fun onCreate() {
    super.onCreate()

    createNotificationChannel()
    startForeground(1, getForegroundNotification())

    sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager

    val sharedPreferences = getSharedPreferences("CrashDetectionPrefs", Context.MODE_PRIVATE)
    val crashDetectionEnabled = sharedPreferences.getBoolean("crashDetectionEnabled", false)

    if (!crashDetectionEnabled) {
      stopSelf()
      return
    }

    try {
      accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
      accelerometer?.let {
        sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
      }
              ?: run { Log.e("CrashDetectionService", "No accelerometer sensor found!") }
    } catch (e: Exception) {
      Log.e("CrashDetectionService", "Sensor registration error: ${e.message}")
    }

    val disposable =
            sensorEventSubject
                    .throttleFirst(1000, TimeUnit.MILLISECONDS)
                    .subscribeOn(Schedulers.io())
                    .observeOn(AndroidSchedulers.mainThread())
                    .subscribe(
                            { event -> handleSensorEvent(event) },
                            { error ->
                              Log.e("CrashDetectionService", "Sensor event error: ${error.message}")
                            }
                    )

    compositeDisposable.add(disposable)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == "REMOVE_NOTIFICATION") {
      removeNotification()
    }
    return START_STICKY
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val soundUri =
              RingtoneManager.getActualDefaultRingtoneUri(
                      applicationContext,
                      RingtoneManager.TYPE_NOTIFICATION
              )

      val attributes =
              AudioAttributes.Builder()
                      .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                      .build()

      val channel =
              NotificationChannel(
                              channelId,
                              "Crash Detection Alerts",
                              NotificationManager.IMPORTANCE_HIGH
                      )
                      .apply {
                        enableLights(true)
                        enableVibration(true)
                        vibrationPattern = longArrayOf(0, 500, 500, 500)
                        setSound(soundUri, attributes)
                      }

      val manager = getSystemService(NotificationManager::class.java)
      manager?.createNotificationChannel(channel)
    }
  }

  private fun getForegroundNotification(): Notification {
    return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Crash Detection Active")
            .setContentText("Monitoring for crashes")
            .setSmallIcon(R.drawable.src_assets_images_logo)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
  }

  private fun handleSensorEvent(event: SensorEvent) {
    val force =
            Math.sqrt(
                    (event.values[0] * event.values[0] +
                                    event.values[1] * event.values[1] +
                                    event.values[2] * event.values[2])
                            .toDouble()
            )

    Log.d("CrashDetectionService", "Force detected: $force")

    if (force > 25) {
      val currentTime = System.currentTimeMillis()
      if (currentTime - lastCrashTime > crashCooldownTime) {
        lastCrashTime = currentTime
        Log.d("CrashDetectionService", "Crash detected with force: $force")
        sendCrashNotification(force)

        val reactContext =
                (application as MainApplication)
                        .reactNativeHost
                        .reactInstanceManager
                        .currentReactContext as?
                        ReactApplicationContext

        reactContext?.let { CrashDetectionModule(it).sendCrashEvent(force) }
                ?: Log.e("CrashDetectionService", "ReactApplicationContext is null")
      } else {
        Log.d("CrashDetectionService", "Ignored crash detection due to cooldown.")
      }
    }
  }

  private fun sendCrashNotification(force: Double) {
    val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    Log.d("CrashDetectionService", "Sound URI: $soundUri")

    val ringtone = RingtoneManager.getRingtone(applicationContext, soundUri)
    ringtone.play()

    val notification =
            NotificationCompat.Builder(this, channelId)
                    .setContentTitle("Crash Detected")
                    .setContentText("A crash has been detected.")
                    .setSmallIcon(R.drawable.src_assets_images_logo)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .setOngoing(false)
                    .setVibrate(longArrayOf(0, 500, 500, 500))
                    .setSound(soundUri)
                    .setContentIntent(createPendingIntent(force))
                    .build()

    val notificationManager = getSystemService(NotificationManager::class.java)
    notificationManager?.notify(1, notification)

    vibrateDevice()
  }

  private fun vibrateDevice() {
    val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    vibrator?.let {
      if (it.hasVibrator()) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          it.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 500, 500, 500), -1))
        } else {
          it.vibrate(longArrayOf(0, 500, 500, 500), -1)
        }
      }
    }
  }

  private fun createPendingIntent(force: Double): PendingIntent {
    val intent =
            Intent(this, MainActivity::class.java).apply {
              putExtra("type", "crash")
              putExtra("force", force)
            }

    return PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  fun removeNotification() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      stopForeground(STOP_FOREGROUND_REMOVE)
    } else {
      stopForeground(true)
    }

    val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.cancel(1)
  }

  override fun onDestroy() {
    super.onDestroy()
    try {
      if (::sensorManager.isInitialized) {
        sensorManager.unregisterListener(this)
      }
    } catch (e: Exception) {
      Log.e("CrashDetectionService", "Sensor unregister error: ${e.message}")
    }

    compositeDisposable.clear()
  }

  override fun onSensorChanged(event: SensorEvent) {
    sensorEventSubject.onNext(event)
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

  override fun onBind(intent: Intent?): IBinder? = null
}
