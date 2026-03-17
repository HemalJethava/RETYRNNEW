// MainActivity
package com.retyrn

import android.Manifest
import android.annotation.SuppressLint
import android.app.PictureInPictureParams
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.Rational
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {
  private val PERMISSION_REQUEST_CODE = 1001
  private val TAG = "MainActivity"

  override fun getMainComponentName(): String = "Retyrn"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
          DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onPictureInPictureModeChanged(
          isInPictureInPictureMode: Boolean,
          newConfig: Configuration
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)

    // Get the instance and call the function on the instance
    PipAndroidModule.getInstance()?.let { module ->
      module.pipModeChanged(isInPictureInPictureMode)
    }
  }

  override fun onUserLeaveHint() {
    super.onUserLeaveHint()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      if (PipAndroidModule.pipAllowedFlag) {
        val params = PictureInPictureParams.Builder().setAspectRatio(Rational(350, 500)).build()
        enterPictureInPictureMode(params)
      }
    }
  }

  fun enterPiPMode() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val params = PictureInPictureParams.Builder().setAspectRatio(Rational(9, 16)).build()
      enterPictureInPictureMode(params)
    }
  }

  @SuppressLint("MissingSuperCall")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    Log.d("MainActivity", "onCreate called")

    checkAndRequestPermissions()

    val reactInstanceManager: ReactInstanceManager =
            (application as MainApplication).reactNativeHost.reactInstanceManager

    reactInstanceManager.addReactInstanceEventListener(
            object : ReactInstanceEventListener {
              override fun onReactContextInitialized(context: ReactContext) {
                Log.d(TAG, "React Native initialized. Processing notification intent.")

                val pendingData = PendingNotificationData.getData()
                if (pendingData != null) {
                  sendEventToReactNative(context, pendingData)
                } else {
                  handleNotificationIntent(intent)
                }
              }
            }
    )
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    Log.d("MainActivity", "onNewIntent called")
    handleNotificationIntent(intent)
  }

  override fun onResume() {
    super.onResume()
    // val reactContext =
    //         (application as ReactApplication)
    //                 .reactNativeHost
    //                 .reactInstanceManager
    //                 .currentReactContext

    val reactContext: ReactContext? =
            if (this.reactActivityDelegate is DefaultReactActivityDelegate) {
              (this.reactActivityDelegate as DefaultReactActivityDelegate)
                      .reactHost
                      ?.currentReactContext
            } else {
              (application as ReactApplication)
                      .reactNativeHost
                      .reactInstanceManager
                      .currentReactContext
            }

    val pendingData = PendingNotificationData.getData()
    Log.e(TAG, "pendingData: $pendingData")
    Log.e(TAG, "reactContext: $reactContext")

    if (pendingData != null && reactContext != null) {
      sendEventToReactNative(reactContext, pendingData)
    }
  }

  private fun checkAndRequestPermissions() {
    val permissions =
            arrayOf(
                    Manifest.permission.FOREGROUND_SERVICE,
                    Manifest.permission.VIBRATE,
                    Manifest.permission.WAKE_LOCK
            )

    val missingPermissions =
            permissions
                    .filter {
                      ContextCompat.checkSelfPermission(this, it) !=
                              PackageManager.PERMISSION_GRANTED
                    }
                    .toTypedArray()

    if (missingPermissions.isNotEmpty()) {
      ActivityCompat.requestPermissions(this, missingPermissions, PERMISSION_REQUEST_CODE)
    }
  }

  private fun handleNotificationIntent(intent: android.content.Intent?) {
    Log.d("MainActivity", "handleNotificationIntent called: $intent")
    val extras = intent?.extras ?: return
    val type = extras.getString("type")
    val force = extras.getDouble("force", 0.0)

    Log.d(TAG, "Intent extras: $extras")

    if (type != null) {
      Log.d(TAG, "Notification tapped with type: $type, force: $force")
      val reactContext: ReactContext? =
              (application as ReactApplication)
                      .reactNativeHost
                      .reactInstanceManager
                      .currentReactContext

      if (reactContext != null) {
        Log.d(TAG, "ReactContext is initialized. Sending event to React Native.")
        sendEventToReactNative(reactContext, mapOf("type" to type, "force" to force))
      } else {
        Log.d(TAG, "ReactContext is not initialized. Storing data for later.")
        PendingNotificationData.storeData(mapOf("type" to type, "force" to force))
      }
    } else {
      Log.d(TAG, "No notification type found.")
    }
  }

  private fun sendEventToReactNative(reactContext: ReactContext, data: Map<String, Any?>) {
    try {
      Log.d(TAG, "Sending event to React Native with data: $data")
      val writableMap: WritableMap = Arguments.createMap()

      data.forEach { (key, value) ->
        when (value) {
          is String -> writableMap.putString(key, value)
          is Int -> writableMap.putInt(key, value)
          is Double -> writableMap.putDouble(key, value)
          is Boolean -> writableMap.putBoolean(key, value)
          else -> writableMap.putString(key, value?.toString())
        }
      }

      if (reactContext.hasActiveCatalystInstance()) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("NotificationTapped", writableMap)
      } else {
        Log.e(TAG, "React Native context is not active. Unable to send event.")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Failed to send event to React Native", e)
    }
  }

  // object PendingNotificationData {
  //   private var storedData: Map<String, Any?>? = null

  //   fun storeData(data: Map<String, Any?>) {
  //     storedData = data
  //   }

  //   fun getData(): Map<String, Any?>? {
  //     return storedData.also { storedData = null }
  //   }
  // }

  object PendingNotificationData {
    private var storedData: Map<String, Any?>? = null
    private var delivered = false

    fun storeData(data: Map<String, Any?>) {
      storedData = data
      delivered = false
    }

    fun getData(): Map<String, Any?>? {
      return if (!delivered) storedData else null
    }

    fun markDelivered() {
      delivered = true
      storedData = null
    }
  }
}
