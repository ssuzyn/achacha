package com.eurachacha.achacha.application.port.output.user;


import com.eurachacha.achacha.domain.model.user.RefreshToken;

public interface RefreshTokenRepository {

	boolean existsByUserId(Integer userId);

	RefreshToken save(RefreshToken refreshToken);
}
