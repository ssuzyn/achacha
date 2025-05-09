package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.RefreshTokenRepository;
import com.eurachacha.achacha.domain.model.user.RefreshToken;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RefreshTokenPersistenceAdapter implements RefreshTokenRepository {

	private final RefreshTokenJpaRepository refreshTokenJpaRepository;

	@Override
	public boolean existsByUserId(Integer userId) {
		return refreshTokenJpaRepository.existsByUserId(userId);
	}

	@Override
	public RefreshToken save(RefreshToken refreshToken) {
		return refreshTokenJpaRepository.save(refreshToken);
	}
}
