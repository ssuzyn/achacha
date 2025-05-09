package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.domain.model.user.FcmToken;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FcmTokenPersistenceAdapter implements FcmTokenRepository {

	private final FcmTokenJpaRepository fcmTokenJpaRepository;

	@Override
	public Optional<FcmToken> findByUserId(Integer userId) {
		return fcmTokenJpaRepository.findByUserId(userId);
	}

	@Override
	public FcmToken save(FcmToken fcmToken) {
		return fcmTokenJpaRepository.save(fcmToken);
	}
}
