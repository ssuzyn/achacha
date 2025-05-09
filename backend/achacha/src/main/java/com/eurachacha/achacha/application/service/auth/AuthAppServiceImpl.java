package com.eurachacha.achacha.application.service.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import com.eurachacha.achacha.application.port.output.auth.AuthServicePort;
import com.eurachacha.achacha.application.port.output.auth.dto.KakaoUserInfoDto;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.infrastructure.security.JwtTokenProvider;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthAppServiceImpl implements AuthAppService {
	private final UserRepository userRepository;
	private final AuthServicePort authServicePort;
	private final JwtTokenProvider jwtTokenProvider;

	// 카카오 제공자 상수
	private static final String KAKAO_PROVIDER = "KAKAO";

	@Override
	@Transactional
	public TokenResponseDto loginWithKakao(KakaoLoginRequestDto requestDto) {
		// 카카오 액세스 토큰으로 사용자 정보 조회
		KakaoUserInfoDto kakaoUserInfo = authServicePort.validateKakaoToken(requestDto.getKakaoAccessToken());

		if (kakaoUserInfo == null) {
			throw new CustomException(ErrorCode.INVALID_TOKEN);
		}

		// 카카오 ID로 사용자 조회 또는 생성
		User user = userRepository.findByProviderAndProviderUserId(KAKAO_PROVIDER, kakaoUserInfo.getId())
			.orElseGet(() -> createKakaoUser(kakaoUserInfo));

		// 닉네임이 변경되었으면 업데이트
		if (!user.getNickname().equals(kakaoUserInfo.getNickname())) {
			user.updateNickname(kakaoUserInfo.getNickname());
		}

		// JWT 토큰 발급
		String accessToken = jwtTokenProvider.createAccessToken(user.getId());
		String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

		return new TokenResponseDto(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpirySeconds());
	}

	@Override
	@Transactional
	public TokenResponseDto refreshToken(String refreshToken) {
		// 리프레시 토큰 검증 및 새 액세스 토큰 발급
		Integer userId = jwtTokenProvider.validateRefreshTokenAndGetUserId(refreshToken);

		// 사용자가 존재하는지 확인
		userRepository.findById(userId);

		String newAccessToken = jwtTokenProvider.createAccessToken(userId);

		return new TokenResponseDto(newAccessToken, refreshToken, jwtTokenProvider.getAccessTokenExpirySeconds());
	}

	private User createKakaoUser(KakaoUserInfoDto kakaoUserInfo) {
		User newUser = User.builder()
			.provider(KAKAO_PROVIDER)
			.providerUserId(kakaoUserInfo.getId())
			.nickname(kakaoUserInfo.getNickname())
			.isDeleted(false)
			.build();

		return userRepository.save(newUser);
	}
}