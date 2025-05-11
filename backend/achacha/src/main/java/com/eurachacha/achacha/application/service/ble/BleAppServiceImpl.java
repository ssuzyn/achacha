package com.eurachacha.achacha.application.service.ble;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.ble.BleAppService;
import com.eurachacha.achacha.application.port.input.ble.dto.response.BleTokenResponseDto;
import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.ble.BleToken;
import com.eurachacha.achacha.domain.service.ble.BleTokenDomainService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BleAppServiceImpl implements BleAppService {

	private final UserRepository userRepository;
	private final BleTokenRepository bleTokenRepository;
	private final BleTokenDomainService bleTokenDomainService;

	@Override
	@Transactional
	public BleTokenResponseDto generateBleToken(String value) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		bleTokenRepository.deleteByUserIdAndValue(userId, value);

		// 토큰 생성
		String newTokenValue = generateToken();

		// 새 토큰 저장
		BleToken bleToken = BleToken.builder()
			.user(userRepository.findById(userId))
			.value(newTokenValue)
			.build();

		bleTokenRepository.save(bleToken);

		return BleTokenResponseDto.builder()
			.bleToken(newTokenValue)
			.build();
	}

	private String generateToken() {
		// 중복되지 않는 새 토큰 생성
		String newTokenValue;
		boolean isDuplicate;
		int attempts = 0;

		do {
			// 최대 시도 횟수 초과 시 로그 기록
			if (attempts++ > 3) {
				log.warn("{}번 째 토큰 생성 시도", attempts);
			}

			// 새 토큰 생성
			newTokenValue = bleTokenDomainService.generateToken();

			// 중복 검사
			isDuplicate = bleTokenRepository.existsByValue(newTokenValue);
		} while (isDuplicate);
		return newTokenValue;
	}
}
