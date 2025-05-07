package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GifticonPersistenceAdapter implements GifticonRepository {

	private final GifticonJpaRepository gifticonJpaRepository;

	@Override
	public Gifticon save(Gifticon gifticon) {
		return gifticonJpaRepository.save(gifticon);
	}

	@Override
	public Slice<AvailableGifticonResponseDto> getAvailableGifticons(Integer userId, GifticonScopeType scope,
		GifticonType type, Pageable pageable) {
		return gifticonJpaRepository.findAvailableGifticons(userId, scope, type, FileType.THUMBNAIL, pageable);
	}

	@Override
	public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId) {
		return gifticonJpaRepository.findAvailableGifticonDetail(
			gifticonId).orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));
	}

	@Override
	public Slice<UsedGifticonResponseDto> getUsedGifticons(Integer userId, GifticonType type, Pageable pageable) {
		return gifticonJpaRepository.findUsedGifticons(userId, type, FileType.THUMBNAIL, pageable);
	}
}
