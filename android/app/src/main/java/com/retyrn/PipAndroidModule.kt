package com.retyrn

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = PipAndroidModule.NAME)
class PipAndroidModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "PipAndroid"
        const val PIP_MODE_CHANGE = "PIP_MODE_CHANGE"
        private var instance: PipAndroidModule? = null

        @JvmStatic var pipAllowedFlag: Boolean = false // <-- @JvmStatic is important

        fun getInstance(): PipAndroidModule? = instance
    }

    init {
        instance = this
    }

    override fun getName(): String = NAME

    /** Emit PiP status to JS */
    fun pipModeChanged(isInPiP: Boolean) {
        Log.d("PIP_DEBUG", "pipModeChanged: $isInPiP")
        val params = Arguments.createMap().apply { putBoolean("isInPiPMode", isInPiP) }
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("PIP_MODE_CHANGE", params)
    }
}
