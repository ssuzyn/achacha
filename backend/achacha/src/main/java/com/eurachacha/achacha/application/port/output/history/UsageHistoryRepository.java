package com.eurachacha.achacha.application.port.output.history;

import java.util.List;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonUsageHistoryResponseDto;
import com.eurachacha.achacha.domain.model.history.UsageHistory;

public interface UsageHistoryRepository {
	UsageHistory saveUsageHistory(UsageHistory usageHistory);

	UsageHistory getUsageHistoryDetail(Integer userId, Integer gifticonId);

	List<GifticonUsageHistoryResponseDto> findUsageHistories(Integer userId, Integer gifticonId);
}
