package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GifticonOwnerHistoryPersistenceAdapter implements GifticonOwnerHistoryRepository {

	private final GifticonOwnerHistoryJpaRepository gifticonOwnerHistoryJpaRepository;

	@Override
	public GifticonOwnerHistory getGifticonOwnerHistoryDetail(Integer userId, Integer gifticonId) {
		return gifticonOwnerHistoryJpaRepository.findOwnerHistoryDetailByUserIdAndGifticonId(userId, gifticonId);
	}
}
