package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.user.FcmToken;

@Repository
public interface FcmTokenJpaRepository extends JpaRepository<FcmToken, Integer> {

	Optional<FcmToken> findByUserId(Integer userId);
}
