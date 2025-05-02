package com.eurachacha.achacha.application.port.input.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonResponseDto;

public interface GifticonAppService {
	GifticonResponseDto saveGifticon(GifticonSaveRequestDto requestDto);

}
