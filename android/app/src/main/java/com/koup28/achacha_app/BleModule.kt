package com.koup28.achacha_app

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.ParcelUuid
import com.facebook.react.bridge.*
import java.util.*

class BleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val bluetoothManager: BluetoothManager = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter
    private var bluetoothLeAdvertiser: BluetoothLeAdvertiser? = null
    private var advertiseCallback: AdvertiseCallback? = null

    override fun getName() = "BleModule"

    @ReactMethod
    fun startAdvertising(serviceUuid: String, promise: Promise) {
        if (bluetoothAdapter == null) {
            promise.reject("BLE_NOT_SUPPORTED", "Bluetooth is not supported on this device")
            return
        }

        if (!bluetoothAdapter!!.isEnabled) {
            promise.reject("BLE_NOT_ENABLED", "Bluetooth is not enabled")
            return
        }

        bluetoothLeAdvertiser = bluetoothAdapter!!.bluetoothLeAdvertiser
        if (bluetoothLeAdvertiser == null) {
            promise.reject("ADVERTISER_NOT_AVAILABLE", "BLE advertiser is not available on this device")
            return
        }

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .setConnectable(true)
            .build()

        try {
            val parcelUuid = ParcelUuid(UUID.fromString(serviceUuid))
            val advertiseData = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .addServiceUuid(parcelUuid)
                .build()

            advertiseCallback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
                    promise.resolve(null)
                }

                override fun onStartFailure(errorCode: Int) {
                    val errorMessage = when (errorCode) {
                        AdvertiseCallback.ADVERTISE_FAILED_ALREADY_STARTED -> "Advertising is already started"
                        AdvertiseCallback.ADVERTISE_FAILED_DATA_TOO_LARGE -> "Advertisement data is too large"
                        AdvertiseCallback.ADVERTISE_FAILED_FEATURE_UNSUPPORTED -> "Advertising is not supported on this device"
                        AdvertiseCallback.ADVERTISE_FAILED_INTERNAL_ERROR -> "Internal error occurred while advertising"
                        AdvertiseCallback.ADVERTISE_FAILED_TOO_MANY_ADVERTISERS -> "No advertising instance is available"
                        else -> "Failed to start advertising with error code: $errorCode"
                    }
                    promise.reject("ADVERTISE_FAILED", errorMessage)
                }
            }

            bluetoothLeAdvertiser!!.startAdvertising(settings, advertiseData, advertiseCallback)
        } catch (e: Exception) {
            promise.reject("ADVERTISE_FAILED", "Failed to start advertising: ${e.message}")
        }
    }

    @ReactMethod
    fun stopAdvertising(promise: Promise) {
        if (bluetoothLeAdvertiser != null && advertiseCallback != null) {
            try {
                bluetoothLeAdvertiser!!.stopAdvertising(advertiseCallback)
                advertiseCallback = null
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("STOP_ADVERTISE_FAILED", e.message)
            }
        } else {
            promise.resolve(null)
        }
    }
} 