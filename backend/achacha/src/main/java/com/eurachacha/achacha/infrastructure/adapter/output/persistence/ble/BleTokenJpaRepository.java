package com.eurachacha.achacha.infrastructure.adapter.output.persistence.ble;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.ble.BleToken;

@Repository
public interface BleTokenJpaRepository extends JpaRepository<BleToken, Integer> {
	void deleteByUserIdAndValue(Integer userId, String value);

	boolean existsByValue(String value);
}
