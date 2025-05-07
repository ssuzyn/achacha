package com.koup28.achacha_app.data

import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface ApiService {
    @GET("api/gifticon/{gifticonId}/barcode") // 실제 API 엔드포인트에 맞게 수정 필요
    suspend fun getGifticonBarcode(
        @Path("gifticonId") gifticonId: Int
    ): Response<BarcodeInfo>
} 