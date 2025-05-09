package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;

public interface GifticonUsageDomainService {
	// 잔액 여부 확인
	boolean hasBalance(Gifticon gifticon, Integer usageAmount);

	void validateAmountGifticonType(Gifticon gifticon);

	void validateAmount(Integer newAmount);

	void validateUsageUser(Integer userId, Integer usageUserId);

	int getFindGifticonRemainingAmount(Integer newAmount, UsageHistory findUsageHistory,
		Gifticon findGifticon);

	int updateUsageHistory(Integer userId, Integer newAmount, Gifticon findGifticon, UsageHistory findUsageHistory);
}
