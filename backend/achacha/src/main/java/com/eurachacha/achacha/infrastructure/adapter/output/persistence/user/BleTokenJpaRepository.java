package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.user.BleToken;

@Repository
public interface BleTokenJpaRepository extends JpaRepository<BleToken, Integer> {
	Optional<BleToken> findByUserId(Integer userId);

	boolean existsByToken(String token);
}
