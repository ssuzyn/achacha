package com.koup28.achacha_app

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.ParcelUuid
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
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

    // 기본 메서드: 개별 파라미터로 UUID와 토큰을 문자열로 직접 받음
    @ReactMethod
    fun startAdvertising(serviceUuidStr: String, bleToken: String, promise: Promise) {
        try {
            // 블루투스 상태 체크
            if (!checkBluetoothStatus(promise)) return

            // 토큰 크기 검사
            val tokenBytes = bleToken.toByteArray(Charsets.UTF_8)
            if (tokenBytes.size > MAX_TOKEN_SIZE) {
                Log.e(TAG, "Token too large: ${tokenBytes.size} bytes (max: $MAX_TOKEN_SIZE bytes)")
                promise.reject("DATA_TOO_LARGE", "Token exceeds maximum size of $MAX_TOKEN_SIZE bytes")
                return
            }

            // UUID 파싱
            val serviceUuid = parseUuidOrReject(serviceUuidStr, promise) ?: return

            // 광고 시작
            startBleAdvertising(serviceUuid, tokenBytes, promise)

        } catch (e: Exception) {
            Log.e(TAG, "Error in startAdvertising", e)
            promise.reject("ADVERTISE_ERROR", e.message)
        }
    }

    // Base64 인코딩된 토큰을 사용하는 메서드 (UUID는 문자열, 토큰은 Base64 인코딩으로 받음)
    @ReactMethod
    fun startAdvertisingWithBase64(serviceUuidStr: String, base64Token: String, promise: Promise) {
        try {
            // 블루투스 상태 체크
            if (!checkBluetoothStatus(promise)) return

            // Base64 디코딩
            val tokenBytes = Base64.decode(base64Token, Base64.DEFAULT)
            
            // 토큰 크기 검사
            if (tokenBytes.size > MAX_TOKEN_SIZE) {
                Log.e(TAG, "Token too large: ${tokenBytes.size} bytes (max: $MAX_TOKEN_SIZE bytes)")
                promise.reject("DATA_TOO_LARGE", "Token exceeds maximum size of $MAX_TOKEN_SIZE bytes")
                return
            }

            // UUID 파싱
            val serviceUuid = parseUuidOrReject(serviceUuidStr, promise) ?: return

            // 광고 시작
            startBleAdvertising(serviceUuid, tokenBytes, promise)

        } catch (e: Exception) {
            Log.e(TAG, "Error in startAdvertisingWithBase64", e)
            promise.reject("ADVERTISE_ERROR", e.message)
        }
    }

    // 최적화된 방법: UUID와 토큰을 하나의 Base64 인코딩 문자열로 합쳐서 받음
    @ReactMethod
    fun startAdvertisingOptimized(combinedBase64Data: String, promise: Promise) {
        try {
            // 블루투스 상태 체크
            if (!checkBluetoothStatus(promise)) return

            // Base64 디코딩
            val combinedBytes = Base64.decode(combinedBase64Data, Base64.DEFAULT)
            
            // 최소 16바이트는 필요 (UUID 길이)
            if (combinedBytes.size < 16) {
                promise.reject("INVALID_DATA", "Combined data too short")
                return
            }

            // 처음 16바이트는 UUID
            val uuidBytes = combinedBytes.copyOfRange(0, 16)
            val tokenBytes = combinedBytes.copyOfRange(16, combinedBytes.size)
            
            // 토큰 크기 검사
            if (tokenBytes.size > MAX_TOKEN_SIZE) {
                Log.e(TAG, "Token too large: ${tokenBytes.size} bytes (max: $MAX_TOKEN_SIZE bytes)")
                promise.reject("DATA_TOO_LARGE", "Token exceeds maximum size of $MAX_TOKEN_SIZE bytes")
                return
            }

            // UUID 생성
            val uuid = getBytesAsUUID(uuidBytes)
            val serviceUuid = ParcelUuid(uuid)
            
            Log.d(TAG, "Extracted UUID: ${uuid}")
            Log.d(TAG, "Token size: ${tokenBytes.size} bytes")

            // 광고 시작
            startBleAdvertising(serviceUuid, tokenBytes, promise)

        } catch (e: Exception) {
            Log.e(TAG, "Error in startAdvertisingOptimized", e)
            promise.reject("ADVERTISE_ERROR", e.message)
        }
    }

    // UUID를 바이트 배열에서 생성하는 유틸리티 메서드
    private fun getBytesAsUUID(bytes: ByteArray): UUID {
        val bb = ByteBuffer.wrap(bytes)
        val high = bb.getLong()
        val low = bb.getLong()
        return UUID(high, low)
    }

    // 블루투스 상태를 확인하는 유틸리티 메서드
    private fun checkBluetoothStatus(promise: Promise): Boolean {
        if (bluetoothAdapter == null) {
            Log.e(TAG, "Bluetooth adapter is null")
            promise.reject("BLE_NOT_SUPPORTED", "Bluetooth is not supported on this device")
            return false
        }

        if (!bluetoothAdapter!!.isEnabled) {
            Log.e(TAG, "Bluetooth is not enabled")
            promise.reject("BLE_NOT_ENABLED", "Bluetooth is not enabled")
            return false
        }

        bluetoothLeAdvertiser = bluetoothAdapter!!.bluetoothLeAdvertiser
        if (bluetoothLeAdvertiser == null) {
            Log.e(TAG, "BLE advertiser is not available")
            promise.reject("ADVERTISER_NOT_AVAILABLE", "BLE advertiser is not available on this device")
            return false
        }
        
        return true
    }

    // UUID 문자열을 파싱하는 유틸리티 메서드
    private fun parseUuidOrReject(serviceUuidStr: String, promise: Promise): ParcelUuid? {
        return try {
            ParcelUuid(UUID.fromString(serviceUuidStr))
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "Invalid UUID format: $serviceUuidStr")
            promise.reject("INVALID_UUID", "Invalid UUID format")
            null
        }
    }

    // BLE 광고를 시작하는 공통 메서드
    private fun startBleAdvertising(serviceUuid: ParcelUuid, tokenBytes: ByteArray, promise: Promise) {
        // 디버그 로그
        Log.d(TAG, "\n=== BLE 광고 데이터 준비 ===")
        Log.d(TAG, "Service UUID: ${serviceUuid.uuid}")
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