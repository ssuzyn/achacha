package com.eurachacha.achacha.application.port.output.user;

import com.eurachacha.achacha.domain.model.user.BleToken;

public interface BleTokenRepository {
	void deleteByUserIdAndValue(Integer userId, String tokenValue);

	BleToken save(BleToken bleToken);

	boolean existsByValue(String token);
}
