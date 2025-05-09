package com.eurachacha.achacha.application.port.input.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;

public interface GifticonUsageAppService {
	void useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto);
}
