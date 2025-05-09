package com.eurachacha.achacha.application.port.output.user;

import java.util.Optional;

import com.eurachacha.achacha.domain.model.user.RefreshToken;

public interface RefreshTokenRepository {

	Optional<RefreshToken> findByUserId(Integer userId);

	RefreshToken save(RefreshToken refreshToken);
}
