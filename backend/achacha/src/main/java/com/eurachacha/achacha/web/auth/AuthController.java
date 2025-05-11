package com.eurachacha.achacha.web.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.dto.request.BleTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import com.eurachacha.achacha.application.port.output.auth.dto.response.BleTokenResponseDto;

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

	@PostMapping("/ble")
	public ResponseEntity<BleTokenResponseDto> generateBleToken(@RequestBody BleTokenRequestDto request) {
		return ResponseEntity.ok(authAppService.generateBleToken(request.getBleTokenValue()));
	}

}