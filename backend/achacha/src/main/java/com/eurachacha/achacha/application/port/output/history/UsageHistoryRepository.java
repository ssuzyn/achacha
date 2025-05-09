package com.eurachacha.achacha.application.port.output.history;

import com.eurachacha.achacha.domain.model.history.UsageHistory;

public interface UsageHistoryRepository {
	UsageHistory saveUsageHistory(UsageHistory usageHistory);

	UsageHistory getUsageHistoryDetail(Integer userId, Integer gifticonId);
}
