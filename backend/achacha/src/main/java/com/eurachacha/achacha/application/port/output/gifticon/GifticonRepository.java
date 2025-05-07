package com.eurachacha.achacha.application.port.output.gifticon;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonCommonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonRepository {
	Gifticon save(Gifticon gifticon);

	Slice<AvailableGifticonCommonResponseDto> getAvailableGifticons(Integer userId, GifticonScopeType scope,
		GifticonType type, Pageable pageable);

	AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId);

	Slice<UsedGifticonResponseDto> getUsedGifticons(Integer userId, GifticonType type, Pageable pageable);

}
