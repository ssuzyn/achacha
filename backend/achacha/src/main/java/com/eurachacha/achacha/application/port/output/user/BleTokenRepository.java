package com.eurachacha.achacha.application.port.output.user;

import java.util.Optional;

import com.eurachacha.achacha.domain.model.user.BleToken;

public interface BleTokenRepository {
	Optional<BleToken> findByUserId(Integer userId);

	BleToken save(BleToken bleToken);

	boolean existsByToken(String token);
}
