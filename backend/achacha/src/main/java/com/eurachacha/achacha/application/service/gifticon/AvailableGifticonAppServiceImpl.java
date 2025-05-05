package com.eurachacha.achacha.application.service.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.AvailableGifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.AvailableGifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.service.gifticon.AvailableGifticonDomainService;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.PageableFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AvailableGifticonAppServiceImpl implements AvailableGifticonAppService {

    private final AvailableGifticonDomainService availableGifticonDomainService;
    private final AvailableGifticonRepository availableGifticonRepository;
    private final PageableFactory pageableFactory;

    @Override
    @Transactional(readOnly = true)
    public AvailableGifticonsResponseDto getAvailableGifticons(GifticonScopeType scope, GifticonType type, GifticonSortType sort, Integer page, Integer size) {

        Integer userId = 1; // 유저 로직 추가 시 변경 필요

        // 페이징 처리
        Pageable pageable = pageableFactory.createPageable(page, size, sort);

        // 쿼리 실행
        Slice<AvailableGifticonResponseDto> gifticonSlice = availableGifticonRepository.getAvailableGifticons(userId, scope, type, pageable);

        return AvailableGifticonsResponseDto.builder()
                .gifticons(gifticonSlice.getContent())
                .hasNextPage(gifticonSlice.hasNext())
                .nextPage(gifticonSlice.hasNext() ? (page != null ? page + 1 : 1) : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId) {

        Integer userId = 1; // 유저 로직 추가 시 변경 필요

        AvailableGifticonDetailResponseDto detailResponseDto = availableGifticonRepository.getAvailableGifticonDetail(userId, gifticonId);

        availableGifticonDomainService.validateGifticonAccess(userId, detailResponseDto.getUserId());

        return detailResponseDto;
    }
}
