package com.koup28.achacha_app.presentation.ui

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

// Import Accompanist Pager and related components
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.HorizontalPager
import com.google.accompanist.pager.rememberPagerState
import androidx.compose.runtime.LaunchedEffect // Keep LaunchedEffect for pager state observation

// 날짜 형식 변환 함수 (YYYY-MM-DD -> YYYY.MM.DD)
fun formatExpiryDate(dateStr: String): String {
    return try {
        val inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE // YYYY-MM-DD
        val outputFormatter = DateTimeFormatter.ofPattern("yyyy.MM.dd")
        LocalDate.parse(dateStr, inputFormatter).format(outputFormatter)
    } catch (e: DateTimeParseException) {
        dateStr // 파싱 실패 시 원본 반환
    }
}

@OptIn(ExperimentalPagerApi::class) // Opt-in for experimental Pager API
@Composable
fun GifticonDetailScreen(
    // Updated parameters
    gifticons: List<ApiGifticon>,
    initialIndex: Int,
    onCurrentGifticonIndexChanged: (Int) -> Unit, // Callback when page changes
    onShowBarcodeClick: (gifticonId: Int) -> Unit,
    // Add callbacks for new buttons
    onShareClick: (gifticonId: Int) -> Unit,
    onUseClick: (gifticonId: Int) -> Unit
) {
    // Handle empty list or invalid index
    if (gifticons.isEmpty() || initialIndex < 0 || initialIndex >= gifticons.size) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("기프티콘 정보를 표시할 수 없습니다.")
        }
        return // Exit composable if data is invalid
    }

    // Remember the pager state, starting from the initial index
    val pagerState = rememberPagerState(initialPage = initialIndex)

    // Use LaunchedEffect to monitor currentPage changes and call the callback
    LaunchedEffect(pagerState.currentPage) {
        onCurrentGifticonIndexChanged(pagerState.currentPage)
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
        // Optional: Add position indicator for the pager here if desired
        // positionIndicator = { HorizontalPagerIndicator(pagerState = pagerState, ...) }
    ) {
        // Use HorizontalPager to enable swipe navigation
        HorizontalPager(
            count = gifticons.size, // Total number of pages
            state = pagerState,     // Control the pager state
            modifier = Modifier.fillMaxSize()
        ) { pageIndex -> // Content lambda for each page
            // Get the gifticon for the current page
            val currentGifticon = gifticons[pageIndex]

            // Column displaying the gifticon details (same as before)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = currentGifticon.brandName,
                    style = MaterialTheme.typography.title3,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = currentGifticon.gifticonName,
                    style = MaterialTheme.typography.body1,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "유효기간: ${formatExpiryDate(currentGifticon.gifticonExpiryDate)}",
                    style = MaterialTheme.typography.caption1,
                    textAlign = TextAlign.Center
                )
                // Reduce spacing above the barcode chip
                Spacer(modifier = Modifier.height(8.dp)) // Reduced from 16.dp
                // 바코드 보기 버튼 (Chip)
                Chip(
                    onClick = { onShowBarcodeClick(currentGifticon.gifticonId) },
                    label = {
                        Text(
                            text = "바코드 보기",
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                    },
                    colors = ChipDefaults.chipColors(
                        backgroundColor = Color(0xFFAECBFA), // 메인 메뉴와 동일한 색상
                        contentColor = Color.Black
                    ),
                    modifier = Modifier.fillMaxWidth(0.8f)
                )
                Spacer(modifier = Modifier.height(8.dp)) // Spacing between barcode and new buttons

                // Row for Share and Use buttons
                Row(
                    modifier = Modifier.fillMaxWidth(0.8f), // Match width with barcode chip
                    horizontalArrangement = Arrangement.SpaceBetween // Space buttons evenly
                ) {
                    // Replace Button with Chip for "나눔"
                    Chip(
                        onClick = { onShareClick(currentGifticon.gifticonId) },
                        modifier = Modifier.weight(1f), // Occupy available space
                        label = { Text("나눔", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) }, // Center text
                        colors = ChipDefaults.secondaryChipColors() // Use secondary colors like list items
                        // colors = ChipDefaults.chipColors(backgroundColor = Color(0xFFB0C4DE)) // Or keep previous button color
                    )
                    Spacer(modifier = Modifier.width(8.dp)) // Space between chips
                    // Replace Button with Chip for "사용"
                    Chip(
                        onClick = { onUseClick(currentGifticon.gifticonId) },
                        modifier = Modifier.weight(1f), // Occupy available space
                        label = { Text("사용", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) }, // Center text
                        colors = ChipDefaults.secondaryChipColors() // Use secondary colors like list items
                        // colors = ChipDefaults.chipColors(backgroundColor = Color(0xFFB0C4DE)) // Or keep previous button color
                    )
                }
            }
        }
    }
} 