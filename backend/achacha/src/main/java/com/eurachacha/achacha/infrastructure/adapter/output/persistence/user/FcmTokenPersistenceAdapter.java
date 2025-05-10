package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.domain.model.user.FcmToken;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FcmTokenPersistenceAdapter implements FcmTokenRepository {

	private final FcmTokenJpaRepository fcmTokenJpaRepository;

	@Override
	public FcmToken findByUserId(Integer userId) {
		return fcmTokenJpaRepository.findByUserId(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.FCM_TOKEN_NOT_FOUND));
	}

	@Override
	public FcmToken save(FcmToken fcmToken) {
		return fcmTokenJpaRepository.save(fcmToken);
	}
}
