package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GifticonPersistenceAdapter implements GifticonRepository {

	private final GifticonJpaRepository gifticonJpaRepository;

	@Override
	public Gifticon save(Gifticon gifticon) {
		return gifticonJpaRepository.save(gifticon);
	}
}
