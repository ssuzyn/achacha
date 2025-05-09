package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.sharebox.Participation;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ParticipationPersistenceAdapter implements ParticipationRepository {

	private final ParticipationJpaRepository participationJpaRepository;

	@Override
	public boolean checkParticipation(Integer userId, Integer shareBoxId) {
		return participationJpaRepository.existsByUserIdAndShareboxId(userId, shareBoxId);
	}

	@Override
	public Participation save(Participation participation) {
		return participationJpaRepository.save(participation);
	}

}
