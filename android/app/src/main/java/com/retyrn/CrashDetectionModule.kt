// CrashDetectionModule.kt
package com.retyrn

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class CrashDetectionModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    private val reactContext: ReactApplicationContext = reactContext
    private val sharedPreferences: SharedPreferences =
            reactContext.getSharedPreferences("CrashDetectionPrefs", Context.MODE_PRIVATE)

    override fun getName(): String {
        return "CrashDetectionModule"
    }

    @ReactMethod
    fun startCrashDetectionService() {
        sharedPreferences.edit().putBoolean("crashDetectionEnabled", true).apply()
        val serviceIntent = Intent(reactContext, CrashDetectionService::class.java)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(reactContext, serviceIntent)
        } else {
            reactContext.startService(serviceIntent)
        }
    }

    @ReactMethod
    fun stopCrashDetectionService() {
        sharedPreferences.edit().putBoolean("crashDetectionEnabled", false).apply()
        val serviceIntent = Intent(reactContext, CrashDetectionService::class.java)
        reactContext.stopService(serviceIntent)
    }

    fun sendCrashEvent(force: Double) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("CrashDetected", force)
    }

    @ReactMethod
    fun clearCrashNotification() {
        val serviceIntent = Intent(reactApplicationContext, CrashDetectionService::class.java)
        reactApplicationContext.startService(serviceIntent) // Ensure service is running

        val removeIntent = Intent(reactApplicationContext, CrashDetectionService::class.java)
        removeIntent.action = "REMOVE_NOTIFICATION"
        reactApplicationContext.startService(removeIntent)
    }

    @ReactMethod
    fun markDelivered() {
        MainActivity.PendingNotificationData.markDelivered()
    }
}
