package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class GifticonMetadataResponseDto {
	private String gifticonBarcodeNumber; // 바코드 번호
	private String brandName; // 브랜드 이름
	private String gifticonName; // 상품명
	private String gifticonExpiryDate; // 유효기간(YYYY-MM-DD 형식)
}
