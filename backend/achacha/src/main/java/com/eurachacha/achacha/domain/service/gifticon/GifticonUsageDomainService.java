package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

public interface GifticonUsageDomainService {
	// 잔액 여부 확인
	boolean hasBalance(Gifticon gifticon, Integer usageAmount);
}
