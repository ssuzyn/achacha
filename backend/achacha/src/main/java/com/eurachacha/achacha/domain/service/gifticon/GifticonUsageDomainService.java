package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;

public interface GifticonUsageDomainService {

	int getFindGifticonRemainingAmount(Integer newAmount, UsageHistory findUsageHistory,
		Gifticon findGifticon);

	int updateUsageHistory(Integer newAmount, Gifticon findGifticon, UsageHistory findUsageHistory);

	void validateSufficientBalance(int remainingAmount, int requiredAmount);

}
