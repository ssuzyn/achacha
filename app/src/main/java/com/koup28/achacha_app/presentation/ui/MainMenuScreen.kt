package com.koup28.achacha_app.presentation.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*

@Composable
fun MainMenuScreen(
    // storedData: String? // 파라미터 제거
    onGifticonManageClick: () -> Unit, // 기프티콘 관리 버튼 클릭 콜백
    onNotificationBoxClick: () -> Unit // 알림함 버튼 클릭 콜백
) {
    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) } // 비네트 추가
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center // 중앙 정렬 유지
        ) {
            Text(
                text = "ㅇㅊㅊ", // 제목 변경
                style = MaterialTheme.typography.title1, // 제목 크기 조정
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 16.dp) // 상단 패딩 추가
            )
            Spacer(modifier = Modifier.height(24.dp)) // 버튼 위 간격 조정

            // 기프티콘 관리 버튼 (Chip) - 스타일 적용
            Chip(
                onClick = onGifticonManageClick,
                label = { 
                    Text(
                        text = "기프티콘 관리",
                        modifier = Modifier.fillMaxWidth(), // 너비 채우기
                        textAlign = TextAlign.Center // 중앙 정렬
                    )
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA), // 배경색 설정
                    contentColor = Color.Black // 텍스트 색상 설정
                ),
                modifier = Modifier.fillMaxWidth(0.8f) // 너비 조정
            )
            Spacer(modifier = Modifier.height(8.dp)) // 버튼 사이 간격

            // 알림함 버튼 (Chip) - 스타일 적용
            Chip(
                onClick = onNotificationBoxClick,
                label = { 
                    Text(
                        text = "알림함",
                        modifier = Modifier.fillMaxWidth(), // 너비 채우기
                        textAlign = TextAlign.Center // 중앙 정렬
                    ) 
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA), // 배경색 설정
                    contentColor = Color.Black // 텍스트 색상 설정
                ),
                modifier = Modifier.fillMaxWidth(0.8f) // 너비 조정
            )

            // // 저장된 정보 표시 제거
            // Spacer(modifier = Modifier.height(8.dp))
            // if (storedData != null) {
            //     Text(
            //         text = "저장된 정보: $storedData",
            //         style = MaterialTheme.typography.caption1,
            //         textAlign = TextAlign.Center
            //     )
            // }
        }
    }
} 