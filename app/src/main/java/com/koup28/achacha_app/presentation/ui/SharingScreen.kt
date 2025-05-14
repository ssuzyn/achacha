package com.koup28.achacha_app.presentation.ui

import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.util.lerp
import androidx.wear.compose.material.*
import kotlinx.coroutines.*
import com.koup28.achacha_app.data.ApiService
import com.koup28.achacha_app.data.GiveAwayRequest
import java.util.UUID
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.clickable

@Composable
fun SharingScreen(
    gifticonId: Int?, // 실제 나눔 로직 시작 시 사용될 ID
    onBackClick: () -> Unit, // 탐색 중지 또는 뒤로 가기
    apiService: ApiService, // ApiService 인스턴스 전달 필요
    context: Context, // LocalContext.current 전달 필요
    onScanFail: () -> Unit // 콜백 추가
) {
    Log.d("NavigationCheck", "SharingScreen (Nearby Search UI) Composable called with gifticonId: $gifticonId")

    val SERVICE_UUID = UUID.fromString("1bf0cbce-7af3-4b59-93f2-0c4c6d170164")
    var isScanning by remember { mutableStateOf(true) }
    var resultText by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    var scanJob by remember { mutableStateOf<Job?>(null) }
    var scannerRef by remember { mutableStateOf<BluetoothLeScanner?>(null) }
    var scanCallbackRef by remember { mutableStateOf<ScanCallback?>(null) }

    // BLE 스캔 및 API 호출 로직
    LaunchedEffect(gifticonId) {
        if (gifticonId == null) return@LaunchedEffect
        val foundUserIds = mutableSetOf<String>()
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val bluetoothAdapter = bluetoothManager.adapter
        val scanner = bluetoothAdapter.bluetoothLeScanner
        scannerRef = scanner

        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val scanRecord = result.scanRecord
                val bleTokenBytes = scanRecord?.getServiceData(ParcelUuid(SERVICE_UUID))
                val bleToken = bleTokenBytes?.toString(Charsets.UTF_8)
                Log.d("BLE_SCAN", "스캔 결과: $bleToken (raw: $bleTokenBytes)")
                if (!bleToken.isNullOrEmpty()) {
                    foundUserIds.add(bleToken)
                    Log.d("BLE_SCAN", "사용자 발견: $bleToken")
                }
            }
            override fun onBatchScanResults(results: List<ScanResult>) {
                Log.d("BLE_SCAN", "배치 스캔 결과: ${results.size}개")
                results.forEach { onScanResult(ScanSettings.CALLBACK_TYPE_ALL_MATCHES, it) }
            }
            override fun onScanFailed(errorCode: Int) {
                Log.e("BLE_SCAN", "스캔 실패: $errorCode")
            }
        }
        scanCallbackRef = scanCallback

        Log.d("BLE_SCAN", "BLE 스캔 시작")
        scanner.startScan(null, ScanSettings.Builder().build(), scanCallback)
        scanJob = coroutineScope.launch {
            delay(5000)
            if (isScanning) {
                Log.d("BLE_SCAN", "BLE 스캔 종료")
                scanner.stopScan(scanCallback)
                isScanning = false
                // API 호출
                Log.d("BLE_SCAN", "발견된 사용자: ${foundUserIds.toList()}")
                if (foundUserIds.isNotEmpty()) {
                    try {
                        Log.d("BLE_SCAN", "나눔 API 호출 시작")
                        val response = apiService.giveAwayGifticon(gifticonId, GiveAwayRequest(foundUserIds.toList()))
                        Log.d("BLE_SCAN", "나눔 API 응답: ${response.code()} / 성공여부: ${response.isSuccessful}")
                        resultText = if (response.isSuccessful) "나눔 성공!" else "나눔 실패: ${response.code()}"
                    } catch (e: Exception) {
                        Log.e("BLE_SCAN", "나눔 API 호출 실패: ${e.localizedMessage}")
                        resultText = "나눔 실패: ${e.localizedMessage}"
                    }
                } else {
                    Log.d("BLE_SCAN", "주변 사용자를 찾지 못함 (serviceUuids: $SERVICE_UUID)")
                    onScanFail() // 콜백 호출
                    return@launch
                }
            }
        }
    }

    // 탐색 중지 버튼 클릭 시 스캔 중단
    fun stopScanEarly() {
        if (isScanning) {
            scannerRef?.let { scanner ->
                scanCallbackRef?.let { callback ->
                    scanner.stopScan(callback)
                }
            }
            scanJob?.cancel()
            isScanning = false
            resultText = "탐색이 중단되었습니다."
        }
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 4.dp)) }, // 패딩 약간 조절
        // Vignette는 레이더 애니메이션과 함께 사용할 경우 화면 가장자리가 어두워져 방해가 될 수 있으므로 일단 제거 고려
        // vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp, vertical = 8.dp), // 패딩 조절
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween // 요소들을 위, 중간, 아래로 분산
        ) {
            Text(
                if (isScanning) "주변 탐색 중..." else "탐색 완료",
                style = MaterialTheme.typography.title3,
                modifier = Modifier.padding(top = 20.dp) // 상단 여백 추가
            )

            RadarAnimation(modifier = Modifier.weight(1f).aspectRatio(1f).padding(8.dp)) // 레이더 애니메이션 영역

            if (resultText.isNotEmpty()) {
                Text(resultText, color = Color.Black, modifier = Modifier.padding(8.dp))
            }

            Chip(
                onClick = {
                    if (isScanning) stopScanEarly() else onBackClick()
                }, // 탐색 중지 시 BLE 스캔 중단, 완료 후엔 뒤로가기
                label = {
                    Text(
                        text = if (isScanning) "탐색 중지" else "뒤로",
                        textAlign = TextAlign.Center, // 텍스트 중앙 정렬 추가
                        modifier = Modifier.fillMaxWidth() // 라벨 영역 너비 채우기
                    )
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA), // 다른 버튼과 유사한 색상
                    contentColor = Color.Black
                ),
                modifier = Modifier
                    .fillMaxWidth(0.5f) // 좌우 폭 더 줄임 (50%)
                    .padding(bottom = 8.dp)
            )
        }
    }
}

@Composable
fun RadarAnimation(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "radar_transition")
    val primaryColor = MaterialTheme.colors.primary

    val animationDuration = 1500
    val initialAlpha = 1f
    val targetAlpha = 0f
    val initialRadiusRatio = 0.1f
    val targetRadiusRatio = 1.0f
    val numCircles = 3
    val delayBetweenCircles = animationDuration / numCircles

    val animatedValues = List(numCircles) { i ->
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = animationDuration, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
                initialStartOffset = StartOffset(i * delayBetweenCircles)
            ),
            label = "radar_circle_$i"
        )
    }

    BoxWithConstraints(modifier = modifier, contentAlignment = Alignment.Center) {
        val canvasSize = constraints.maxWidth.coerceAtMost(constraints.maxHeight)
        val maxRadius = canvasSize / 2f

        Canvas(modifier = Modifier.size(canvasSize.dp)) { // size를 dp로 변환
            val center = Offset(size.width / 2, size.height / 2)

            animatedValues.forEach { animatedFloatState ->
                val animatedValue = animatedFloatState.value

                val currentRadius = lerp(initialRadiusRatio, targetRadiusRatio, animatedValue) * maxRadius
                val currentAlpha = lerp(initialAlpha, targetAlpha, animatedValue)
                val currentStrokeWidth = lerp(4f, 1f, animatedValue)

                if (currentAlpha > 0) {
                    drawCircle(
                        color = primaryColor.copy(alpha = currentAlpha),
                        radius = currentRadius,
                        center = center,
                        style = Stroke(width = currentStrokeWidth)
                    )
                }
            }
        }
    }
}

// 탐색 실패 전용 스크린 추가
@Composable
fun BleScanFailScreen(onBackClick: () -> Unit) {
    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 4.dp)) },
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable { onBackClick() }, // 전체 화면 터치 시 뒤로
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "탐색 실패!",
                    style = MaterialTheme.typography.title2,
                    color = MaterialTheme.colors.onBackground, // 기존 텍스트와 동일한 색상
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "현재 탐색되는 사용자가 없습니다.",
                    style = MaterialTheme.typography.body1,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
                // Chip 버튼 제거
            }
        }
    }
}

// Preview는 필요시 유지하거나 수정
// @Preview(device = WearDevices.SMALL_ROUND, showSystemUi = true)
// @Composable
// fun SharingScreenPreview() {
//     Achacha_wearOSTheme {
//         SharingScreen(gifticonId = 123, navController = rememberSwipeDismissableNavController())
//     }
// } 