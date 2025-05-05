package com.eurachacha.achacha.application.port.input.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface AvailableGifticonAppService {
    AvailableGifticonsResponseDto getAvailableGifticons(GifticonScopeType scope, GifticonType type, GifticonSortType sort, Integer page, Integer size);
    AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId);
}
