package com.eurachacha.achacha.application.port.output.user;

import com.eurachacha.achacha.domain.model.user.FcmToken;

public interface FcmTokenRepository {

	FcmToken findByUserId(Integer userId);

	FcmToken save(FcmToken fcmToken);
}
