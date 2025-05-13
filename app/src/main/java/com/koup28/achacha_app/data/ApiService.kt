package com.koup28.achacha_app.data

import com.koup28.achacha_app.presentation.ui.ApiGifticon
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.POST
import retrofit2.http.Body

// API 응답 전체 구조 (페이지네이션 포함)
@Serializable
data class GifticonListApiResponse(
    val gifticons: List<ApiGifticon>,
    val hasNextPage: Boolean,
    val nextPage: Int?
)

// BarcodeInfo는 BarcodeInfo.kt 파일에 정의되어 있다고 가정
// data class BarcodeInfo(...)

data class GiveAwayRequest(val userIds: List<String>)

interface ApiService {

    // 기프티콘 목록 조회 API
    @GET("api/available-gifticons")
    suspend fun getAvailableGifticons(
        @Header("Authorization") authorization: String,
        @Query("scope") scope: String = "ALL",
        @Query("type") type: String? = null,
        @Query("sort") sort: String = "CREATED_DESC",
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 10
    ): Response<GifticonListApiResponse>

    // 바코드 정보 조회 API (수정: 인증 헤더 추가)
    @GET("api/available-gifticons/{gifticonId}/barcode")
    suspend fun getGifticonBarcode(
        @Header("Authorization") authorization: String,
        @Path("gifticonId") gifticonId: Int
    ): Response<BarcodeInfo>

    // 기프티콘 상세 정보 조회 API 추가
    @GET("api/available-gifticons/{gifticonId}")
    suspend fun getGifticonDetail(
        @Header("Authorization") authorization: String,
        @Path("gifticonId") gifticonId: Int
    ): Response<ApiGifticon>

    // 상품권 사용 API 추가
    @POST("api/product-gifticons/{gifticonId}/use")
    suspend fun useProductGifticon(
        @Header("Authorization") authorization: String,
        @Path("gifticonId") gifticonId: Int,
        @Body message: UseGifticonRequest
    ): Response<Unit>

    // 금액형 기프티콘 사용 API 추가
    @POST("api/amount-gifticons/{gifticonId}/use")
    suspend fun useAmountGifticon(
        @Header("Authorization") authorization: String,
        @Path("gifticonId") gifticonId: Int,
        @Body request: UseAmountGifticonRequest
    ): Response<UseAmountGifticonResponse>

    @POST("/api/gifticons/{gifticonId}/give-away")
    suspend fun giveAwayGifticon(
        @Path("gifticonId") gifticonId: Int,
        @Body request: GiveAwayRequest
    ): retrofit2.Response<Unit>
}

// 상품권 사용 요청 바디 데이터 클래스
@Serializable
data class UseGifticonRequest(val message: String)

@Serializable
data class UseAmountGifticonRequest(val usageAmount: Int)

@Serializable
data class UseAmountGifticonResponse(val message: String) 