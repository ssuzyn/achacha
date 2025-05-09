package com.eurachacha.achacha.application.port.input.auth.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoLoginRequestDto {
	private String kakaoAccessToken;  // 카카오에서 발급한 액세스 토큰
}
