// android/app/src/main/java/com/achacha_app/BleAdvertisingModule.java
package com.achacha_app;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Context;
import android.os.Build;
import android.os.ParcelUuid;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.nio.ByteBuffer;
import java.util.UUID;

public class BleAdvertisingModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private BluetoothLeAdvertiser mBluetoothLeAdvertiser;
    private AdvertiseCallback mAdvertiseCallback;
    private boolean isAdvertising = false;

    private static final String TAG = "BleAdvertisingModule";

    public BleAdvertisingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "BleAdvertisingModule";
    }

    @ReactMethod
    public void startAdvertising(String serviceUUIDString, String userToken, String userName, Promise promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            promise.reject("UNSUPPORTED", "BLE Advertising not supported on this device");
            return;
        }

        BluetoothManager bluetoothManager = (BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager == null) {
            promise.reject("ERROR", "Cannot access BluetoothManager");
            return;
        }

        BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();
        if (bluetoothAdapter == null) {
            promise.reject("ERROR", "Bluetooth not supported on this device");
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            promise.reject("ERROR", "Bluetooth is not enabled");
            return;
        }

        try {
            mBluetoothLeAdvertiser = bluetoothAdapter.getBluetoothLeAdvertiser();
            if (mBluetoothLeAdvertiser == null) {
                promise.reject("ERROR", "BLE Advertising not supported on this device");
                return;
            }

            // 이미 광고 중이라면 중지
            if (isAdvertising) {
                stopAdvertising(null);
            }

            // 서비스 UUID 설정
            ParcelUuid parcelUuid = new ParcelUuid(UUID.fromString(serviceUUIDString));

            // 광고 설정
            AdvertiseSettings settings = new AdvertiseSettings.Builder()
                    .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
                    .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
                    .setConnectable(true)
                    .setTimeout(0) // 0 means advertising doesn't timeout
                    .build();

            // 광고 데이터 생성 (최대 31바이트)
            AdvertiseData.Builder dataBuilder = new AdvertiseData.Builder()
                    .setIncludeDeviceName(false)
                    .addServiceUuid(parcelUuid);

            // userToken과 userName 추가 (가능한 범위 내에서)
            if (userToken != null && !userToken.isEmpty()) {
                byte[] tokenData = userToken.getBytes();
                if (tokenData.length <= 20) { // 최대 크기 제한
                    dataBuilder.addServiceData(parcelUuid, tokenData);
                }
            }

            AdvertiseData advertiseData = dataBuilder.build();

            // 응답 데이터 생성 (필요한 경우)
            AdvertiseData.Builder scanResponseBuilder = new AdvertiseData.Builder();
            if (userName != null && !userName.isEmpty()) {
                byte[] nameData = userName.getBytes();
                if (nameData.length <= 20) { // 최대 크기 제한
                    scanResponseBuilder.addServiceData(
                            new ParcelUuid(UUID.fromString("00002222-0000-1000-8000-00805F9B34FB")),
                            nameData);
                }
            }
            AdvertiseData scanResponse = scanResponseBuilder.build();

            // 콜백 설정
            mAdvertiseCallback = new AdvertiseCallback() {
                @Override
                public void onStartSuccess(AdvertiseSettings settingsInEffect) {
                    super.onStartSuccess(settingsInEffect);
                    isAdvertising = true;
                    Log.d(TAG, "BLE Advertising started successfully");
                    promise.resolve(true);
                }

                @Override
                public void onStartFailure(int errorCode) {
                    super.onStartFailure(errorCode);
                    isAdvertising = false;
                    Log.e(TAG, "Failed to start BLE Advertising, error: " + errorCode);
                    promise.reject("ERROR", "Failed to start BLE Advertising, error: " + errorCode);
                }
            };

            // 광고 시작
            mBluetoothLeAdvertiser.startAdvertising(settings, advertiseData, scanResponse, mAdvertiseCallback);
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting BLE Advertising: " + e.getMessage());
            promise.reject("ERROR", "Error starting BLE Advertising: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopAdvertising(Promise promise) {
        try {
            if (mBluetoothLeAdvertiser != null && mAdvertiseCallback != null && isAdvertising) {
                mBluetoothLeAdvertiser.stopAdvertising(mAdvertiseCallback);
                isAdvertising = false;
                Log.d(TAG, "BLE Advertising stopped");
                if (promise != null) {
                    promise.resolve(true);
                }
            } else {
                Log.d(TAG, "BLE Advertising was not running");
                if (promise != null) {
                    promise.resolve(false);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error stopping BLE Advertising: " + e.getMessage());
            if (promise != null) {
                promise.reject("ERROR", "Error stopping BLE Advertising: " + e.getMessage());
            }
        }
    }

    @ReactMethod
    public void isAdvertising(Promise promise) {
        promise.resolve(isAdvertising);
    }
}