package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmountGifticonUsageHistoriesResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private Integer gifticonOriginalAmount;
	private Integer gifticonRemainingAmount;
	private List<AmountGifticonUsageHistoryResponseDto> usageHistory;
}
