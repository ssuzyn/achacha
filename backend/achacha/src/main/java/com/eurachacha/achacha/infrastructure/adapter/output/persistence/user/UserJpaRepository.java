package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.user.User;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Integer> {
}
