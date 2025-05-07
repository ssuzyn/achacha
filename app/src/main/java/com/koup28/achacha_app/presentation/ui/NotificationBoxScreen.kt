package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.*

// API 응답 형식에 맞춘 알림 데이터 클래스
data class NotificationData(
    val notificationId: Int,
    val notificationTitle: String,
    val notificationContent: String,
    val notificationType: String
)

// 임시로 알림 타입에 따른 아이콘 매핑 함수
@Composable
fun getIconForNotificationType(type: String): ImageVector {
    return when (type) {
        "EXPIRY_DATE" -> Icons.Outlined.EventAvailable // 예시 아이콘
        "LOCATION_BASED" -> Icons.Outlined.LocationOn // 예시 아이콘
        // 다른 타입에 대한 아이콘 추가
        else -> Icons.Filled.Notifications // 기본 아이콘
    }
}

@Composable
fun NotificationBoxScreen(
    onBackClick: () -> Unit // 시스템 뒤로가기 또는 UI 내 뒤로가기 액션 시 호출됩니다.
) {
    val listState = rememberScalingLazyListState()

    // 시스템 뒤로가기 버튼 처리
    BackHandler(enabled = true) {
        onBackClick()
    }

    val dummyNotifications = remember {
        listOf(
            NotificationData(
                notificationId = 1,
                notificationTitle = "유효기간 만료 알림",
                notificationContent = "아메리카노의 유효기간이 7일 남았습니다",
                notificationType = "EXPIRY_DATE"
            ),
            NotificationData(
                notificationId = 2,
                notificationTitle = "근처 매장 알림",
                notificationContent = "기프티콘을 사용할 수 있는 '스타벅스' 매장이 있어요",
                notificationType = "LOCATION_BASED"
            ),
            NotificationData(
                notificationId = 3,
                notificationTitle = "기프티콘 수신",
                notificationContent = "\'카페라떼\' 기프티콘을 선물 받았습니다.",
                notificationType = "RECEIVE_GIFTICON"
            ),
            NotificationData(
                notificationId = 4,
                notificationTitle = "나눔 알림",
                notificationContent = "\'내 나눔박스\'에 \'조각케이크\'가 등록되었습니다.",
                notificationType = "SHAREBOX_GIFTICON"
            )
        )
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
        ScalingLazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 8.dp),
            state = listState,
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.Top) // 아이템 간 간격 조정
        ) {
            item {
                Text(
                    text = "알림함",
                    style = MaterialTheme.typography.title2,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 24.dp, bottom = 8.dp)
                )
            }

            items(dummyNotifications) { notification ->
                Chip(
                    onClick = { /* TODO: 알림 클릭 시 동작 구현 */ },
                    label = {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(
                                modifier = Modifier.weight(1f) // 텍스트 영역이 남은 공간 차지
                            ) {
                                Text(
                                    text = notification.notificationTitle,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp, // 이미지와 유사한 폰트 크기
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = notification.notificationContent,
                                    style = MaterialTheme.typography.body2,
                                    fontSize = 13.sp, // 이미지와 유사한 폰트 크기
                                    color = Color.LightGray, // 약간 더 밝은 회색
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp)) // 텍스트와 아이콘 간 간격
                            Icon(
                                imageVector = getIconForNotificationType(notification.notificationType),
                                contentDescription = "알림 아이콘", // contentDescription 추가
                                modifier = Modifier.size(ChipDefaults.IconSize) // 기본 아이콘 크기
                            )
                        }
                    },
                    colors = ChipDefaults.chipColors(
                        backgroundColor = Color(0xFF3E3E4A), // 이미지와 유사한 배경색
                        contentColor = Color.White // 내부 콘텐츠 색상
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp) // 내부 패딩 조정
                )
            }

            // 뒤로가기 버튼 제거
        }
    }
} 