package com.eurachacha.achacha.application.port.output.history;

import java.util.List;

import com.eurachacha.achacha.domain.model.history.UsageHistory;

public interface UsageHistoryRepository {
	UsageHistory saveUsageHistory(UsageHistory usageHistory);

	UsageHistory getUsageHistoryDetail(Integer userId, Integer gifticonId);

	List<UsageHistory> findUsageHistories(Integer gifticonId);

	UsageHistory findByIdAndGifticonIdAndUserId(Integer usageHistoryId, Integer gifticonId, Integer userId);

	void delete(UsageHistory usageHistory);
}
