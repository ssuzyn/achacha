package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmountGifticonUsageHistoryResponseDto {
	private Integer usageHistoryId;
	private Integer usageAmount;
	private LocalDateTime usageHistoryCreatedAt;
	private Integer userId;
	private String userName;
}
