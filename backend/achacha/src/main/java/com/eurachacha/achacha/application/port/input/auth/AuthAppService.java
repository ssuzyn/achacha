package com.eurachacha.achacha.application.port.input.auth;

import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import com.eurachacha.achacha.application.port.output.auth.dto.response.BleTokenResponseDto;

public interface AuthAppService {
	TokenResponseDto loginWithKakao(KakaoLoginRequestDto requestDto);

	TokenResponseDto refreshToken(RefreshTokenRequestDto requestDto);

	BleTokenResponseDto generateBleToken(String tokenValue);
}
