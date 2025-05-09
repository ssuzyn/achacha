package com.eurachacha.achacha.web.auth;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final AuthAppService authAppService;

	public AuthController(AuthAppService authAppService) {
		this.authAppService = authAppService;
	}

	@PostMapping("/kakao")
	public ResponseEntity<TokenResponseDto> kakaoLogin(@RequestBody KakaoLoginRequestDto requestDto) {
		TokenResponseDto tokenResponseDto = authAppService.loginWithKakao(requestDto);
		return ResponseEntity.ok(tokenResponseDto);
	}

	@PostMapping("/refresh")
	public ResponseEntity<TokenResponseDto> refreshToken(@RequestParam String refreshToken) {
		TokenResponseDto tokenResponseDto = authAppService.refreshToken(refreshToken);
		return ResponseEntity.ok(tokenResponseDto);
	}
}