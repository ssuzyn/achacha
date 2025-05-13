package com.eurachacha.achacha.application.service.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.user.UserAppService;
import com.eurachacha.achacha.application.port.input.user.dto.response.UserInfoResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAppServiceImpl implements UserAppService {

	private final SecurityServicePort securityServicePort;

	@Override
	public UserInfoResponseDto getUserInfo(Integer userId) {
		User user = securityServicePort.getLoggedInUser();

		if (!user.getId().equals(userId)) {
			throw new CustomException(ErrorCode.FORBIDDEN_ACCESS);
		}

		return UserInfoResponseDto.builder()
			.userId(user.getId())
			.userName(user.getName())
			.socialId(user.getProviderUserId())
			.socialType(user.getProvider())
			.registeredAt(user.getCreatedAt().toLocalDate())
			.build();

	}
}
