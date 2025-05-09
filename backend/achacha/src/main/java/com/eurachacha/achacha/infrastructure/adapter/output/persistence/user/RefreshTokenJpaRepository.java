package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.user.RefreshToken;

@Repository
public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Integer> {

	boolean existsByUserId(Integer userId);
}
