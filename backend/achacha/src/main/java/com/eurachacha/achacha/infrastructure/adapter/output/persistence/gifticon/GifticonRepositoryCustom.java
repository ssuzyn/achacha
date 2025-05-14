package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonRepositoryCustom {
	Slice<AvailableGifticonResponseDto> findAvailableGifticons(
		Integer userId,
		GifticonScopeType scope,
		GifticonType type,
		Pageable pageable
	);

	Slice<UsedGifticonResponseDto> findUsedGifticons(
		Integer userId,
		GifticonType type,
		Pageable pageable);

	Map<Integer, Long> countGifticonsByShareBoxIds(List<Integer> shareBoxIds);
}
