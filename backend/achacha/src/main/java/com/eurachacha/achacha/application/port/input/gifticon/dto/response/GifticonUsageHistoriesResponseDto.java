package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.util.List;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GifticonUsageHistoriesResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private GifticonType gifticonType;
	private Integer gifticonOriginalAmount;
	private Integer gifticonRemainingAmount;
	private List<GifticonUsageHistoryResponseDto> usageHistory;
}
