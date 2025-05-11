package com.eurachacha.achacha.application.port.output.ble;

import com.eurachacha.achacha.domain.ble.BleToken;

public interface BleTokenRepository {
	void deleteByUserIdAndValue(Integer userId, String value);

	BleToken save(BleToken bleToken);

	boolean existsByValue(String value);
}
