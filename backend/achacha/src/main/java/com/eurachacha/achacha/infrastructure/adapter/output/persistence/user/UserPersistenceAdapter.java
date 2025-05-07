package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepository {

	private final UserJpaRepository userJpaRepository;

	@Override
	public User findById(Integer id) {
		return userJpaRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR));
	}
}
