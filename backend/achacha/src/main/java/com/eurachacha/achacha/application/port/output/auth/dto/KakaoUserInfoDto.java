package com.eurachacha.achacha.application.port.output.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KakaoUserInfoDto {
	private String id;
	private String nickname;
}
