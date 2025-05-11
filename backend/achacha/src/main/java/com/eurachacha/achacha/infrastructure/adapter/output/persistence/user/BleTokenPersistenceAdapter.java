package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.BleTokenRepository;
import com.eurachacha.achacha.domain.model.user.BleToken;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BleTokenPersistenceAdapter implements BleTokenRepository {

	private final BleTokenJpaRepository bleTokenJpaRepository;

	@Override
	public Optional<BleToken> findByUserId(Integer userId) {
		return bleTokenJpaRepository.findByUserId(userId);
	}

	@Override
	public BleToken save(BleToken bleToken) {
		return bleTokenJpaRepository.save(bleToken);
	}

	@Override
	public boolean existsByToken(String token) {
		return bleTokenJpaRepository.existsByToken(token);
	}
}
