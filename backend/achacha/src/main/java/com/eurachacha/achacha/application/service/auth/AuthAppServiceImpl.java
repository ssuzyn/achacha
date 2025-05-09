package com.eurachacha.achacha.application.service.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import com.eurachacha.achacha.application.port.output.auth.AuthServicePort;
import com.eurachacha.achacha.application.port.output.auth.dto.response.KakaoUserInfoDto;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.port.output.user.RefreshTokenRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.user.FcmToken;
import com.eurachacha.achacha.domain.model.user.RefreshToken;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.infrastructure.security.JwtTokenProvider;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthAppServiceImpl implements AuthAppService {
	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final FcmTokenRepository fcmTokenRepository;
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
		if (!user.getName().equals(kakaoUserInfo.getNickname())) {
			user.updateName(kakaoUserInfo.getNickname());
		}

		// FCM 토큰 저장
		if (StringUtils.hasText(requestDto.getFcmToken())) {
			saveFcmToken(user, requestDto.getFcmToken());
		}

		// JWT 토큰 발급
		String accessToken = jwtTokenProvider.createAccessToken(user.getId());
		String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

		// 리프레시 토큰 저장
		saveRefreshToken(user, refreshToken);

		return new TokenResponseDto(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpirySeconds());
	}

	@Override
	@Transactional
	public TokenResponseDto refreshToken(RefreshTokenRequestDto requestDto) {
		// 리프레시 토큰 검증 및 새 액세스 토큰 발급
		Integer userId = jwtTokenProvider.validateRefreshTokenAndGetUserId(requestDto.getRefreshToken());

		// 사용자가 존재하는지 확인
		User user = userRepository.findById(userId);

		// 사용자의 리프레시 토큰이 존재하는지만 확인
		if (!refreshTokenRepository.existsByUserId(userId)) {
			throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
		}

		String newAccessToken = jwtTokenProvider.createAccessToken(userId);

		return new TokenResponseDto(newAccessToken, requestDto.getRefreshToken(),
			jwtTokenProvider.getAccessTokenExpirySeconds());
	}

	private User createKakaoUser(KakaoUserInfoDto kakaoUserInfo) {
		User newUser = User.builder()
			.provider(KAKAO_PROVIDER)
			.providerUserId(kakaoUserInfo.getId())
			.name(kakaoUserInfo.getNickname())
			.isDeleted(false)
			.build();

		return userRepository.save(newUser);
	}

	// RefreshToken 저장 메서드
	private void saveRefreshToken(User user, String tokenValue) {
		RefreshToken refreshToken = RefreshToken.builder()
			.user(user)
			.value(tokenValue)
			.build();
		refreshTokenRepository.save(refreshToken);
	}

	// FCM 토큰 저장 메서드
	private void saveFcmToken(User user, String tokenValue) {
		FcmToken fcmToken = FcmToken.builder()
			.user(user)
			.value(tokenValue)
			.build();
		fcmTokenRepository.save(fcmToken);
	}

	// @Override
	// @Transactional
	// public void logout(Integer userId, String refreshToken) {
	// 	// 리프레시 + FCM 토큰 삭제 필요
	// 	refreshTokenRepository.deleteByValue(refreshToken);
	//
	// }
}