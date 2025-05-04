package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDto;
import com.eurachacha.achacha.application.port.output.gifticon.AvailableGifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AvailableGifticonPersistenceAdapter implements AvailableGifticonRepository {

    private final AvailableGifticonJpaRepository availableGifticonJpaRepository;

    @Override
    public Slice<AvailableGifticonDto> getAvailableGifticons(Integer userId, GifticonScopeType scope, GifticonType type, Pageable pageable) {
        return availableGifticonJpaRepository.findAvailableGifticons(userId, scope, type, FileType.THUMBNAIL, pageable);
    }
}
