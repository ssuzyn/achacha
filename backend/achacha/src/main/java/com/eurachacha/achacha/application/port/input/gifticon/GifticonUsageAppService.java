package com.eurachacha.achacha.application.port.input.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;

public interface GifticonUsageAppService {
	String useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto);
}
