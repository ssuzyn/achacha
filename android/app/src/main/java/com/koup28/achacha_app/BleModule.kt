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

            try {
                // 원본 데이터 로깅
                Log.d(TAG, "수신된 JSON 데이터: $jsonString")

                // 광고 데이터 파싱
                val jsonObject = JSONObject(jsonString)
                val serviceUUID = jsonObject.getString("SERVICE_UUID")
                val bleToken = jsonObject.getString("bleToken")

                Log.d(TAG, "파싱된 데이터:")
                Log.d(TAG, "- SERVICE_UUID: $serviceUUID")
                Log.d(TAG, "- bleToken: $bleToken")

                // UUID 문자열 길이 검증
                if (serviceUUID.length != 32) {
                    Log.e(TAG, "Invalid UUID length: ${serviceUUID.length} (expected 32)")
                    promise.reject("INVALID_UUID", "Invalid UUID length")
                    return
                }

                // BLE 토큰 길이 검증
                if (bleToken.isEmpty()) {
                    Log.e(TAG, "BLE 토큰이 비어있습니다")
                    promise.reject("INVALID_TOKEN", "BLE token is empty")
                    return
                }

                // 하이픈 추가 (정확한 위치에)
                val formattedUuid = StringBuilder().apply {
                    append(serviceUUID.substring(0, 8))  // 8자리
                    append("-")
                    append(serviceUUID.substring(8, 12))  // 4자리
                    append("-")
                    append(serviceUUID.substring(12, 16))  // 4자리
                    append("-")
                    append(serviceUUID.substring(16, 20))  // 4자리
                    append("-")
                    append(serviceUUID.substring(20, 32))  // 12자리
                }.toString()

                Log.d(TAG, "=== BLE 광고 정보 ===")
                Log.d(TAG, "서비스 UUID: $formattedUuid")
                Log.d(TAG, "BLE 토큰: $bleToken")
                Log.d(TAG, "===================")

                // UUID 변환
                val uuid = try {
                    UUID.fromString(formattedUuid)
                } catch (e: IllegalArgumentException) {
                    Log.e(TAG, "Invalid UUID format: $formattedUuid", e)
                    promise.reject("INVALID_UUID", "Invalid UUID format")
                    return
                }

                // 광고 설정
                val settings = AdvertiseSettings.Builder()
                    .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                    .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                    .setConnectable(true)
                    .setTimeout(0)
                    .build()

                // 광고 데이터 준비
                val parcelUuid = ParcelUuid(uuid)
                val advertiseData = AdvertiseData.Builder()
                    .setIncludeDeviceName(false)
                    .addServiceUuid(parcelUuid)
                    .addServiceData(parcelUuid, bleToken.toByteArray(Charsets.UTF_8))
                    .build()

                // 데이터 크기 로깅
                Log.d(TAG, "Service UUID size: 16 bytes")
                Log.d(TAG, "BLE Token size: ${bleToken.toByteArray(Charsets.UTF_8).size} bytes")
                Log.d(TAG, "Total payload size: ${16 + bleToken.toByteArray(Charsets.UTF_8).size} bytes")

                // 콜백 설정
                advertiseCallback = object : AdvertiseCallback() {
                    override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
                        Log.d(TAG, "광고 시작 성공!")
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
                        Log.e(TAG, "광고 시작 실패: $errorMessage")
                        promise.reject("ADVERTISE_FAILED", errorMessage)
                    }
                }

                // 광고 시작
                bluetoothLeAdvertiser!!.startAdvertising(settings, advertiseData, advertiseCallback)

            } catch (e: Exception) {
                Log.e(TAG, "광고 시작 중 오류 발생", e)
                Log.e(TAG, "오류 메시지: ${e.message}")
                Log.e(TAG, "오류 스택트레이스:", e)
                promise.reject("ADVERTISE_FAILED", "Failed to start advertising: ${e.message}")
            }

        } catch (e: Exception) {
            Log.e(TAG, "광고 시작 중 오류 발생", e)
            promise.reject("ADVERTISE_FAILED", "Failed to start advertising: ${e.message}")
        }
    }

    @ReactMethod
    fun stopAdvertising(promise: Promise) {
        try {
            if (bluetoothLeAdvertiser != null && advertiseCallback != null) {
                bluetoothLeAdvertiser!!.stopAdvertising(advertiseCallback)
                advertiseCallback = null
                Log.d(TAG, "Advertising stopped successfully")
                promise.resolve(null)
            } else {
                Log.d(TAG, "No active advertising to stop")
                promise.resolve(null)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping advertising", e)
            promise.reject("STOP_ADVERTISE_FAILED", e.message)
        }
    }
} 