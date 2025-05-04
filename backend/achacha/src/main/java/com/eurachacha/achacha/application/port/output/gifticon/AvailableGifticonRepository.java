package com.eurachacha.achacha.application.port.output.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

public interface AvailableGifticonRepository {
    Slice<AvailableGifticonDto> getAvailableGifticons(Integer userId, GifticonScopeType scope, GifticonType type, Pageable pageable);

}
