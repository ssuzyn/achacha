package com.eurachacha.achacha.infrastructure.adapter.output.auth;

import java.math.BigInteger;
import java.security.SecureRandom;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.auth.BleTokenServicePort;
import com.eurachacha.achacha.application.port.output.user.BleTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BleTokenServiceAdapter implements BleTokenServicePort {

	private final BleTokenRepository bleTokenRepository;

	// 토큰 생성에 사용할 문자셋
	private static final String CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

	// 기본 토큰 길이 - 8바이트(64비트)
	private static final int TOKEN_BYTES = 8;

	// 고유한 BLE 토큰 생성 (중복 검사 포함)
	@Override
	public String generateUniqueToken() {
		String token;
		int attempts = 0;

		do {
			if (attempts++ > 3) {
				log.warn("토큰 생성 충돌이 {}번의 시도 후 감지되었습니다.", attempts);
			}

			token = generateToken();
		} while (bleTokenRepository.existsByToken(token));

		return token;
	}
	
	// 랜덤 토큰 생성 및 Base62 인코딩
	private String generateToken() {
		byte[] randomBytes = new byte[TOKEN_BYTES];
		new SecureRandom().nextBytes(randomBytes);

		// Base62 인코딩 구현
		BigInteger number = new BigInteger(1, randomBytes);
		StringBuilder sb = new StringBuilder();
		BigInteger base = BigInteger.valueOf(CHARS.length());

		while (number.compareTo(BigInteger.ZERO) > 0) {
			BigInteger[] divmod = number.divideAndRemainder(base);
			number = divmod[0];
			int digit = divmod[1].intValue();
			sb.append(CHARS.charAt(digit));
		}

		// 길이가 너무 짧은 경우 패딩 추가
		while (sb.length() < 10) { // 64비트는 약 10-11자리 Base62 문자열
			sb.append(CHARS.charAt(0));
		}

		return sb.reverse().toString();
	}
}
