package com.eurachacha.achacha.web.auth;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthAppService authAppService;

	@PostMapping("/kakao")
	public ResponseEntity<TokenResponseDto> kakaoLogin(@RequestBody KakaoLoginRequestDto requestDto) {
		TokenResponseDto tokenResponseDto = authAppService.loginWithKakao(requestDto);
		return ResponseEntity.ok(tokenResponseDto);
	}

	@PostMapping("/refresh")
	public ResponseEntity<TokenResponseDto> refreshToken(@RequestBody RefreshTokenRequestDto requestDto) {
		TokenResponseDto tokenResponseDto = authAppService.refreshToken(requestDto);
		return ResponseEntity.ok(tokenResponseDto);
	}
}