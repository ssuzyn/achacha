package com.koup28.achacha_app.presentation.ui

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

@Composable
fun SharingScreen(
    gifticonId: Int?, // 실제 나눔 로직 시작 시 사용될 ID
    onBackClick: () -> Unit // 탐색 중지 또는 뒤로 가기
) {
    Log.d("NavigationCheck", "SharingScreen (Nearby Search UI) Composable called with gifticonId: $gifticonId")

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
                "주변 탐색 중...",
                style = MaterialTheme.typography.title3,
                modifier = Modifier.padding(top = 20.dp) // 상단 여백 추가
            )

            RadarAnimation(modifier = Modifier.weight(1f).aspectRatio(1f).padding(8.dp)) // 레이더 애니메이션 영역

            Chip(
                onClick = onBackClick, // 탐색 중지 시 이전 화면으로
                label = {
                    Text(
                        text = "탐색 중지",
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

// Preview는 필요시 유지하거나 수정
// @Preview(device = WearDevices.SMALL_ROUND, showSystemUi = true)
// @Composable
// fun SharingScreenPreview() {
//     Achacha_wearOSTheme {
//         SharingScreen(gifticonId = 123, navController = rememberSwipeDismissableNavController())
//     }
// } 