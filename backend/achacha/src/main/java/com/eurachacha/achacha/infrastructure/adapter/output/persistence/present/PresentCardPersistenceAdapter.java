package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.present.PresentCardRepository;
import com.eurachacha.achacha.domain.model.present.PresentCard;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PresentCardPersistenceAdapter implements PresentCardRepository {
	private final PresentCardJpaRepository presentCardJpaRepository;

	@Override
	public PresentCard save(PresentCard presentCard) {
		return presentCardJpaRepository.save(presentCard);
	}

	@Override
	public boolean existsByPresentCardCode(String presentCardCode) {
		return presentCardJpaRepository.existsByCode(presentCardCode);
	}
}
