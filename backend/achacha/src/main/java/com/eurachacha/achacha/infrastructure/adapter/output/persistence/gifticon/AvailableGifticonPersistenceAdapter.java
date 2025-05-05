package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.AvailableGifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AvailableGifticonPersistenceAdapter implements AvailableGifticonRepository {

	private final AvailableGifticonJpaRepository availableGifticonJpaRepository;

	@Override
	public Slice<AvailableGifticonResponseDto> getAvailableGifticons(Integer userId, GifticonScopeType scope,
		GifticonType type, Pageable pageable) {
		return availableGifticonJpaRepository.findAvailableGifticons(userId, scope, type, FileType.THUMBNAIL, pageable);
	}

	@Override
	public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer userId, Integer gifticonId) {

		AvailableGifticonDetailResponseDto availableGifticonDetail = availableGifticonJpaRepository.findAvailableGifticonDetail(
			gifticonId, userId);

		if (availableGifticonDetail == null) {
			throw new CustomException(ErrorCode.GIFTICON_NOT_FOUND);
		}

		return availableGifticonDetail;
	}
}
