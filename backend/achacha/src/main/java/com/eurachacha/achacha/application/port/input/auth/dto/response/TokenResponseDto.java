package com.eurachacha.achacha.application.port.input.auth.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponseDto {
	private String accessToken;
	private String refreshToken;
	private long expiresIn;
	private String bleToken;
	private LocalDateTime bleTokenExpiresAt;
}
