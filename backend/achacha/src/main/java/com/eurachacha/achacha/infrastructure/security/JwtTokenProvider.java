package com.eurachacha.achacha.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.infrastructure.config.JwtProperties;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

	private final JwtProperties jwtProperties;
	private SecretKey key;

	// 초기화 메서드
	private void initializeKey() {
		if (key == null) {
			key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
		}
	}

	public String createAccessToken(Integer userId) {
		initializeKey();
		return createToken(userId, jwtProperties.getAccessTokenExpirySeconds());
	}

	public String createRefreshToken(Integer userId) {
		initializeKey();
		return createToken(userId, jwtProperties.getRefreshTokenExpirySeconds());
	}

	private String createToken(Integer userId, long expirySeconds) {
		Date now = new Date();
		Date validity = new Date(now.getTime() + expirySeconds * 1000);

		return Jwts.builder()
			.subject(userId.toString())
			.issuedAt(now)
			.expiration(validity)
			.signWith(key)
			.compact();
	}

	public Integer validateRefreshTokenAndGetUserId(String refreshToken) {
		initializeKey();
		return Integer.parseInt(
			Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(refreshToken)
				.getPayload()
				.getSubject()
		);
	}

	public Integer validateAccessTokenAndGetUserId(String accessToken) {
		initializeKey();
		return Integer.parseInt(
			Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(accessToken)
				.getPayload()
				.getSubject()
		);
	}

	public long getAccessTokenExpirySeconds() {
		return jwtProperties.getAccessTokenExpirySeconds();
	}
}