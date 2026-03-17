// BootReceiver.kt
package com.retyrn

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
      // Start CrashDetectionService on boot
      val serviceIntent = Intent(context, CrashDetectionService::class.java)
      context.startForegroundService(serviceIntent)
    }
  }
}
