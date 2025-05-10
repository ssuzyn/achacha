package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.user.RefreshToken;

@Repository
public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Integer> {

	Optional<RefreshToken> findByUserIdAndValue(Integer userId, String value);

	boolean existsByUserId(Integer userId);
}
