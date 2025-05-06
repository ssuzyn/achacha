package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.* // Material 포함 SwipeToDismissBox
import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

// API 응답 구조에 맞는 데이터 클래스 (필드 상세 반영)
@Serializable
data class ApiGifticon(
    val gifticonId: Int,
    val gifticonName: String,
    val gifticonType: String? = null, // 사용 안 할 수도 있지만 정의
    val gifticonExpiryDate: String,
    val gifticonRemainingAmount: Int? = null, // 잔액 필드 추가 (Nullable Int)
    val brandId: Int? = null,
    val brandName: String,
    val scope: String? = null,
    val userId: Int? = null,
    val userName: String? = null,
    val shareBoxId: Int? = null,
    val shareBoxName: String? = null,
    val thumbnailPath: String? = null
)

@Serializable
data class GifticonResponse(
    val gifticons: List<ApiGifticon>
)

// D-day 계산 함수 (유지)
fun calculateDday(expiryDateStr: String): Long? {
    return try { // 함수 본문 및 return 추가
        val formatter = DateTimeFormatter.ISO_LOCAL_DATE // "YYYY-MM-DD"
        val expiryDate = LocalDate.parse(expiryDateStr, formatter)
        val today = LocalDate.now()
        ChronoUnit.DAYS.between(today, expiryDate)
    } catch (e: Exception) {
        null // 날짜 파싱 실패 시 null 반환
    }
}

// --- 임시 UI 상태 데이터 클래스 (ViewModel 구현 전 테스트용) ---
// 실제로는 ViewModel 파일에 정의
data class GifticonListUiState(
    val isLoading: Boolean = false,
    val gifticons: List<ApiGifticon> = emptyList(),
    val error: String? = null
)
// ----------------------------------------------------------

@Composable
fun GifticonListScreen(
    onGifticonClick: (gifticonId: Int) -> Unit,
    onBackPress: () -> Unit
) {
    // --- 임시 상태 데이터 사용 (ViewModel 구현 전) ---
    val uiState = remember { 
         GifticonListUiState(
             isLoading = false,
             gifticons = List(5) { // 임시 데이터 생성 시 필드 반영
                 ApiGifticon(
                     gifticonId = it + 100, // ID 예시
                     gifticonName = "API 상품명 ${it + 1} 테스트",
                     // 모든 기프티콘이 만료되지 않도록 수정 (최소 D-0부터 시작)
                     gifticonExpiryDate = LocalDate.now().plusDays( (it * 7).toLong() ).toString(), 
                     brandName = "API 브랜드 ${it % 2}",
                     thumbnailPath = if (it % 3 == 0) null else "/images/dummy.jpg" // 썸네일 경로 예시
                 )
             }
         )
    }
    // ---------------------------------------

    val listState = rememberScalingLazyListState()

    // 시스템 뒤로가기 버튼 처리
    BackHandler(enabled = true) {
        onBackPress()
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
         when {
             uiState.isLoading -> { /* ... 로딩 UI ... */ }
             uiState.error != null -> { /* ... 에러 UI ... */ }
             else -> {
                ScalingLazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    state = listState,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    item { 
                         Text(
                             text = "기프티콘 관리",
                             style = MaterialTheme.typography.title2,
                             textAlign = TextAlign.Center,
                             modifier = Modifier.padding(bottom = 8.dp, top = 24.dp)
                         )
                     }

                    if (uiState.gifticons.isEmpty()) {
                        item { /* ... 빈 목록 Text ... */ }
                    } else {
                        items(uiState.gifticons.size) { index ->
                            val gifticon = uiState.gifticons[index]
                            val dDay = calculateDday(gifticon.gifticonExpiryDate)
                            Chip(
                                onClick = { onGifticonClick(gifticon.gifticonId) },
                                label = { 
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(
                                            modifier = Modifier.weight(1f)
                                                .padding(start = 8.dp, end = 8.dp)
                                        ) {
                                            Text(
                                                text = gifticon.brandName,
                                                style = MaterialTheme.typography.caption2,
                                                fontSize = 11.sp,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(
                                                text = gifticon.gifticonName,
                                                style = MaterialTheme.typography.body2,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        Text(
                                            text = when { 
                                                dDay == null -> "-" 
                                                dDay < 0 -> "만료" // 이 경우는 이제 더미 데이터에서 발생하지 않음
                                                else -> "D-$dDay"
                                            },
                                            style = MaterialTheme.typography.body1,
                                            textAlign = TextAlign.End,
                                            color = when {
                                                dDay == null -> Color.Gray
                                                dDay < 0 -> Color.DarkGray // 이 경우는 이제 더미 데이터에서 발생하지 않음
                                                dDay < 7 -> Color.Red
                                                else -> Color.Unspecified
                                            }
                                        )
                                    }
                                },
                                colors = ChipDefaults.secondaryChipColors(),
                                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                            )
                        }
                    }
                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
} 