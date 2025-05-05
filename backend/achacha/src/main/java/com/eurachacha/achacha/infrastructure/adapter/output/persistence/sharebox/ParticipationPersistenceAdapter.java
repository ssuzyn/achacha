package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ParticipationPersistenceAdapter implements ParticipationRepository {

	private final ParticipationJpaRepository participationJpaRepository;

	@Override
	public Participation checkParticipation(Integer userId, Integer shareBoxId) {
		return participationJpaRepository.checkParticipation(userId, shareBoxId)
			.orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS));
	}

}
