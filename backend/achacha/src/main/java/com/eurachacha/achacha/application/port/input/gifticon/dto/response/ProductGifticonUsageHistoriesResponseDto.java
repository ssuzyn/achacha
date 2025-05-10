package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductGifticonUsageHistoriesResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private ProductGifticonUsageHistoryResponseDto usageHistory;
}
