package com.eurachacha.achacha.infrastructure.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eurachacha.achacha.domain.model.ble.BleToken;
import com.eurachacha.achacha.infrastructure.adapter.output.auth.JwtTokenServiceAdapter;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.ble.BleTokenPersistenceAdapter;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.fcm.FcmTokenPersistenceAdapter;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.user.RefreshTokenPersistenceAdapter;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class CustomLogoutFilter extends OncePerRequestFilter {
	private final RefreshTokenPersistenceAdapter refreshTokenPersistenceAdapter;
	private final FcmTokenPersistenceAdapter fcmTokenPersistenceAdapter;
	private final BleTokenPersistenceAdapter bleTokenPersistenceAdapter;
	private final JwtTokenServiceAdapter jwtTokenServiceAdapter;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {
		// 로그아웃 요청 경로 확인
		if (!isLogoutRequest(request)) {
			filterChain.doFilter(request, response);
			return;
		}

		// 1. 사용자 ID 추출
		Integer userId = extractUserIdFromToken(request);

		// 2. 토큰 정보 추출 및 처리
		Map<String, String> tokenMap = objectMapper.readValue(request.getInputStream(), Map.class);
		processTokens(userId, tokenMap);

		// 3. 성공 응답 반환
		response.setStatus(HttpStatus.OK.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("\"로그아웃 성공\"");
	}

	private boolean isLogoutRequest(HttpServletRequest request) {
		return "/api/auth/logout".equals(request.getServletPath()) && "POST".equals(request.getMethod());
	}

	private Integer extractUserIdFromToken(HttpServletRequest request) {
		String authorization = request.getHeader("Authorization");
		if (authorization != null && authorization.startsWith("Bearer ")) {
			try {
				String accessToken = authorization.substring("Bearer ".length());
				return jwtTokenServiceAdapter.validateAccessTokenAndGetUserId(accessToken);
			} catch (Exception e) {
				log.warn("액세스 토큰 검증 실패: {}", e.getMessage());
			}
		}
		return null;
	}

	private void processTokens(Integer userId, Map<String, String> tokenMap) {
		// RefreshToken 처리
		String refreshToken = tokenMap.get("refreshToken");
		if (StringUtils.hasText(refreshToken)) {
			// userId가 없는 경우 refreshToken에서 추출
			if (userId == null) {
				try {
					userId = jwtTokenServiceAdapter.validateRefreshTokenAndGetUserId(refreshToken);
				} catch (Exception e) {
					log.warn("리프레시 토큰 검증 실패: {}", e.getMessage());
				}
			}

			if (userId != null && refreshTokenPersistenceAdapter.existsByUserId(userId)) {
				try {
					refreshTokenPersistenceAdapter.deleteByUserIdAndValue(userId, refreshToken);
					log.info("사용자 ID {}의 리프레시 토큰 삭제됨", userId);
				} catch (Exception e) {
					log.warn("리프레시 토큰 삭제 실패: {}", e.getMessage());
				}
			}
		}

		// FcmToken 처리 (userId가 있는 경우에만)
		String fcmToken = tokenMap.get("fcmToken");
		if (StringUtils.hasText(fcmToken) && userId != null) {
			try {
				fcmTokenPersistenceAdapter.deleteByUserIdAndValue(userId, fcmToken);
				log.info("사용자 ID {}의 FCM 토큰 삭제됨", userId);
			} catch (Exception e) {
				log.warn("FCM 토큰 삭제 실패: {}", e.getMessage());
			}
		}

		// BleToken 처리
		String bleToken = tokenMap.get("bleToken");
		if (StringUtils.hasText(bleToken)) {
			try {
				BleToken token = bleTokenPersistenceAdapter.findByValue(bleToken);
				if (token != null) {
					bleTokenPersistenceAdapter.deleteByUserIdAndValue(token.getUser().getId(), bleToken);
					log.info("사용자 ID {}의 BLE 토큰 삭제됨", token.getUser().getId());
				}
			} catch (Exception e) {
				log.warn("BLE 토큰 삭제 실패: {}", e.getMessage());
			}
		}
	}
}
