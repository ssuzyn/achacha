package com.eurachacha.achacha.domain.service.gifticon;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

@Service
public class GifticonUsageDomainServiceImpl implements GifticonUsageDomainService {

	@Override
	public boolean hasBalance(Gifticon gifticon, Integer usageAmount) {
		return usageAmount > gifticon.getRemainingAmount();
	}

}
