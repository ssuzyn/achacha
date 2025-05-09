package com.eurachacha.achacha.application.port.output.user;

import java.util.Optional;

import com.eurachacha.achacha.domain.model.user.FcmToken;

public interface FcmTokenRepository {

	Optional<FcmToken> findByUserId(Integer userId);

	FcmToken save(FcmToken fcmToken);
}
