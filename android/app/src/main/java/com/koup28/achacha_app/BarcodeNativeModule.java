package com.koup28.achacha_app;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Point;
import android.graphics.Rect;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

public class BarcodeNativeModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BarcodeNativeModule";
    private final ReactApplicationContext reactContext;

    public BarcodeNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "BarcodeNativeModule";
    }

    @ReactMethod
    public void detectBarcode(String imageUri, Promise promise) {
        try {
            // 이미지 로드
            Uri uri = Uri.parse(imageUri);
            InputImage image = InputImage.fromFilePath(reactContext, uri);

            // 모든 바코드 형식 검색
            BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(
                            Barcode.FORMAT_ALL_FORMATS)
                    .build();

            // 바코드 스캐너 생성
            BarcodeScanner scanner = BarcodeScanning.getClient(options);

            // 바코드 감지 작업 수행
            Task<List<Barcode>> result = scanner.process(image)
                    .addOnSuccessListener(new OnSuccessListener<List<Barcode>>() {
                        @Override
                        public void onSuccess(List<Barcode> barcodes) {
                            // 바코드 감지 결과 처리
                            WritableMap resultMap = Arguments.createMap();
                            if (barcodes.size() > 0) {
                                resultMap.putBoolean("success", true);
                                
                                WritableArray barcodeArray = Arguments.createArray();
                                for (Barcode barcode : barcodes) {
                                    WritableMap barcodeMap = Arguments.createMap();
                                    
                                    // 바코드 값
                                    String value = barcode.getRawValue();
                                    barcodeMap.putString("value", value != null ? value : "");
                                    
                                    // 바코드 형식
                                    String format = getBarcodeFormatString(barcode.getFormat());
                                    barcodeMap.putString("format", format);
                                    
                                    // 바코드 경계 상자 (바운딩 박스)
                                    if (barcode.getBoundingBox() != null) {
                                        Rect bounds = barcode.getBoundingBox();
                                        WritableMap boundingBox = Arguments.createMap();
                                        boundingBox.putInt("x", bounds.left);
                                        boundingBox.putInt("y", bounds.top);
                                        boundingBox.putInt("width", bounds.width());
                                        boundingBox.putInt("height", bounds.height());
                                        barcodeMap.putMap("boundingBox", boundingBox);
                                    }
                                    
                                    // 바코드 코너 포인트 (더 정확한 영역을 위해)
                                    if (barcode.getCornerPoints() != null) {
                                        Point[] cornerPoints = barcode.getCornerPoints();
                                        WritableArray pointsArray = Arguments.createArray();
                                        
                                        for (Point point : cornerPoints) {
                                            WritableMap pointMap = Arguments.createMap();
                                            pointMap.putInt("x", point.x);
                                            pointMap.putInt("y", point.y);
                                            pointsArray.pushMap(pointMap);
                                        }
                                        
                                        barcodeMap.putArray("cornerPoints", pointsArray);
                                    }
                                    
                                    barcodeArray.pushMap(barcodeMap);
                                }
                                
                                resultMap.putArray("barcodes", barcodeArray);
                            } else {
                                resultMap.putBoolean("success", false);
                                resultMap.putString("message", "바코드를 찾을 수 없습니다.");
                            }
                            
                            promise.resolve(resultMap);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            // 에러 처리
                            Log.e(TAG, "바코드 감지 실패", e);
                            promise.reject("BARCODE_DETECTION_ERROR", "바코드 감지 중 오류 발생: " + e.getMessage(), e);
                        }
                    });
        } catch (IOException e) {
            Log.e(TAG, "이미지 로드 실패", e);
            promise.reject("IMAGE_LOAD_ERROR", "이미지 로드 중 오류 발생: " + e.getMessage(), e);
        } catch (Exception e) {
            Log.e(TAG, "예상치 못한 오류", e);
            promise.reject("UNEXPECTED_ERROR", "예상치 못한 오류 발생: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void cropBarcodeArea(String imageUri, int x, int y, int width, int height, Promise promise) {
        try {
            // 이미지 로드
            Uri uri = Uri.parse(imageUri);
            InputStream inputStream = reactContext.getContentResolver().openInputStream(uri);
            Bitmap originalBitmap = BitmapFactory.decodeStream(inputStream);
            inputStream.close();
            
            // 원본 이미지 크기
            int imageWidth = originalBitmap.getWidth();
            int imageHeight = originalBitmap.getHeight();
            
            int cropX = x;
            int cropY = y;
            int cropWidth = width;
            int cropHeight = height;
            
            // 바코드 타입에 따라 여백 조정 (특히 1D 바코드는 더 많은 여백 필요)
            boolean is1DBarcode = false; // 기본값
            
            // 바코드 종류에 따른 여백 계산
            double paddingFactorX;
            double paddingFactorY;
            
            if (is1DBarcode) {
                // 1D 바코드는 가로 방향으로 더 많은 여백 필요
                paddingFactorX = 0.3; // 가로 30%
                paddingFactorY = 0.2; // 세로 20%
            } else {
                // 2D 바코드 (QR 등)
                paddingFactorX = 0.2; // 가로 20%
                paddingFactorY = 0.2; // 세로 20%
            }
            
            // 여백 적용
            int paddingX = (int)(cropWidth * paddingFactorX);
            int paddingY = (int)(cropHeight * paddingFactorY);
            
            // 최종 크롭 영역 계산 (여백 포함)
            cropX = Math.max(0, cropX - paddingX);
            cropY = Math.max(0, cropY - paddingY);
            cropWidth = Math.min(imageWidth - cropX, cropWidth + (paddingX * 2));
            cropHeight = Math.min(imageHeight - cropY, cropHeight + (paddingY * 2));
            
            // 안전 검사: 크롭 영역이 이미지 경계 내에 있는지 확인
            if (cropX < 0) cropX = 0;
            if (cropY < 0) cropY = 0;
            if (cropX + cropWidth > imageWidth) cropWidth = imageWidth - cropX;
            if (cropY + cropHeight > imageHeight) cropHeight = imageHeight - cropY;
            
            // 바코드 영역 크롭
            Bitmap croppedBitmap = Bitmap.createBitmap(originalBitmap, cropX, cropY, cropWidth, cropHeight);

            // 크롭된 이미지 저장
            File outputDir = reactContext.getCacheDir();
            File outputFile = File.createTempFile("cropped_barcode_", ".jpg", outputDir);
            OutputStream outputStream = new FileOutputStream(outputFile);
            croppedBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream);
            outputStream.close();

            // 결과 반환
            WritableMap resultMap = Arguments.createMap();
            resultMap.putBoolean("success", true);
            resultMap.putString("croppedImageUri", "file://" + outputFile.getAbsolutePath());
            resultMap.putInt("cropX", cropX);
            resultMap.putInt("cropY", cropY);
            resultMap.putInt("cropWidth", cropWidth);
            resultMap.putInt("cropHeight", cropHeight);
            promise.resolve(resultMap);

        } catch (IOException e) {
            Log.e(TAG, "이미지 크롭 실패", e);
            promise.reject("IMAGE_CROP_ERROR", "이미지 크롭 중 오류 발생: " + e.getMessage(), e);
        } catch (Exception e) {
            Log.e(TAG, "예상치 못한 오류", e);
            promise.reject("UNEXPECTED_ERROR", "예상치 못한 오류 발생: " + e.getMessage(), e);
        }
    }

    private String getBarcodeFormatString(int format) {
        switch (format) {
            case Barcode.FORMAT_CODE_128: return "CODE_128";
            case Barcode.FORMAT_CODE_39: return "CODE_39";
            case Barcode.FORMAT_CODE_93: return "CODE_93";
            case Barcode.FORMAT_CODABAR: return "CODABAR";
            case Barcode.FORMAT_DATA_MATRIX: return "DATA_MATRIX";
            case Barcode.FORMAT_EAN_13: return "EAN_13";
            case Barcode.FORMAT_EAN_8: return "EAN_8";
            case Barcode.FORMAT_ITF: return "ITF";
            case Barcode.FORMAT_QR_CODE: return "QR_CODE";
            case Barcode.FORMAT_UPC_A: return "UPC_A";
            case Barcode.FORMAT_UPC_E: return "UPC_E";
            case Barcode.FORMAT_PDF417: return "PDF417";
            case Barcode.FORMAT_AZTEC: return "AZTEC";
            default: return "UNKNOWN";
        }
    }
} 