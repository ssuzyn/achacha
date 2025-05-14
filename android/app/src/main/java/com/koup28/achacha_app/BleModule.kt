package com.koup28.achacha_app

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONObject
import java.util.*

class BleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "BleModule"
        private const val MAX_TOKEN_SIZE = 13 // 31(최대) - 2(헤더) - 16(UUID)
    }

    private val bluetoothManager: BluetoothManager = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter
    private var bluetoothLeAdvertiser: BluetoothLeAdvertiser? = null
    private var advertiseCallback: AdvertiseCallback? = null

    override fun getName() = "BleModule"

    @ReactMethod
    fun startAdvertising(jsonString: String, promise: Promise) {
        try {
            // 블루투스 상태 체크
            if (bluetoothAdapter == null) {
                Log.e(TAG, "Bluetooth adapter is null")
                promise.reject("BLE_NOT_SUPPORTED", "Bluetooth is not supported on this device")
                return
            }

            if (!bluetoothAdapter!!.isEnabled) {
                Log.e(TAG, "Bluetooth is not enabled")
                promise.reject("BLE_NOT_ENABLED", "Bluetooth is not enabled")
                return
            }

            bluetoothLeAdvertiser = bluetoothAdapter!!.bluetoothLeAdvertiser
            if (bluetoothLeAdvertiser == null) {
                Log.e(TAG, "BLE advertiser is not available")
                promise.reject("ADVERTISER_NOT_AVAILABLE", "BLE advertiser is not available on this device")
                return
            }

            // JSON 파싱
            val jsonObject = JSONObject(jsonString)
            if (!jsonObject.has("SERVICE_UUID") || !jsonObject.has("bleToken")) {
                Log.e(TAG, "Required data missing")
                promise.reject("INVALID_DATA", "SERVICE_UUID or bleToken not found")
                return
            }

            val serviceUuidStr = jsonObject.getString("SERVICE_UUID")
            val bleToken = jsonObject.getString("bleToken")

            // 토큰 크기 검사
            val tokenBytes = bleToken.toByteArray(Charsets.UTF_8)
            if (tokenBytes.size > MAX_TOKEN_SIZE) {
                Log.e(TAG, "Token too large: ${tokenBytes.size} bytes (max: $MAX_TOKEN_SIZE bytes)")
                promise.reject("DATA_TOO_LARGE", "Token exceeds maximum size of $MAX_TOKEN_SIZE bytes")
                return
            }

            // UUID 파싱
            val serviceUuid = try {
                ParcelUuid(UUID.fromString(serviceUuidStr))
            } catch (e: IllegalArgumentException) {
                Log.e(TAG, "Invalid UUID format: $serviceUuidStr")
                promise.reject("INVALID_UUID", "Invalid UUID format")
                return
            }

            // 디버그 로그
            Log.d(TAG, "\n=== BLE 광고 데이터 준비 ===")
            Log.d(TAG, "Service UUID: $serviceUuidStr")
            Log.d(TAG, "Token: $bleToken")
            Log.d(TAG, "Token size: ${tokenBytes.size} bytes")

            // 광고 설정
            val settings = AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(true)
                .setTimeout(0)
                .build()

            // 광고 데이터 구성 - 최소한의 데이터만 포함
            val advertiseData = AdvertiseData.Builder()
                .setIncludeDeviceName(false) // 디바이스 이름 제외
                .addServiceUuid(serviceUuid) // Service UUID 추가
                .addServiceData(serviceUuid, tokenBytes) // Service Data 추가
                .build()

            // 광고 콜백
            advertiseCallback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
                    Log.d(TAG, "Advertisement started successfully")
                    promise.resolve(null)
                }

                override fun onStartFailure(errorCode: Int) {
                    val errorMessage = when (errorCode) {
                        ADVERTISE_FAILED_ALREADY_STARTED -> "Already advertising"
                        ADVERTISE_FAILED_DATA_TOO_LARGE -> "Advertisement data too large"
                        ADVERTISE_FAILED_FEATURE_UNSUPPORTED -> "Feature not supported"
                        ADVERTISE_FAILED_INTERNAL_ERROR -> "Internal error"
                        ADVERTISE_FAILED_TOO_MANY_ADVERTISERS -> "Too many advertisers"
                        else -> "Unknown error: $errorCode"
                    }
                    Log.e(TAG, "Failed to start advertising: $errorMessage")
                    promise.reject("ADVERTISE_FAILED", errorMessage)
                }
            }

            // 광고 시작
            bluetoothLeAdvertiser!!.startAdvertising(settings, advertiseData, advertiseCallback)
            Log.d(TAG, "Advertisement request sent")

        } catch (e: Exception) {
            Log.e(TAG, "Error in startAdvertising", e)
            promise.reject("ADVERTISE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopAdvertising(promise: Promise) {
        try {
            if (bluetoothLeAdvertiser != null && advertiseCallback != null) {
                bluetoothLeAdvertiser!!.stopAdvertising(advertiseCallback)
                advertiseCallback = null
                Log.d(TAG, "Advertisement stopped")
                promise.resolve(null)
            } else {
                Log.d(TAG, "No active advertisement to stop")
                promise.resolve(null)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in stopAdvertising", e)
            promise.reject("STOP_ADVERTISE_ERROR", e.message)
        }
    }
}