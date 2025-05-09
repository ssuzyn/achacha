package com.eurachacha.achacha.infrastructure.adapter.output.auth;

import com.eurachacha.achacha.application.port.output.auth.AuthServicePort;
import com.eurachacha.achacha.application.port.output.auth.dto.KakaoUserInfoDto;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class KakaoAuthAdapter implements AuthServicePort {

	private final RestTemplate restTemplate;
	private static final String KAKAO_API_URL = "https://kapi.kakao.com";

	public KakaoAuthAdapter(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@Override
	public KakaoUserInfoDto validateKakaoToken(String kakaoAccessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + kakaoAccessToken);

		HttpEntity<String> entity = new HttpEntity<>(headers);

		try {
			ResponseEntity<KakaoUserResponse> response = restTemplate.exchange(
				KAKAO_API_URL + "/v2/user/me",
				HttpMethod.GET,
				entity,
				KakaoUserResponse.class
			);

			if (response.getBody() == null) {
				throw new CustomException(ErrorCode.KAKAO_API_ERROR);
			}

			KakaoUserResponse userResponse = response.getBody();

			// null 체크 추가
			if (userResponse.getKakao_account() == null ||
				userResponse.getKakao_account().getProfile() == null ||
				userResponse.getKakao_account().getProfile().getNickname() == null) {
				throw new CustomException(ErrorCode.KAKAO_API_ERROR);
			}

			return new KakaoUserInfoDto(
				String.valueOf(userResponse.getId()),
				userResponse.getKakao_account().getProfile().getNickname()
			);

		} catch (HttpClientErrorException e) {
			if (e.getStatusCode().is4xxClientError()) {
				throw new CustomException(ErrorCode.INVALID_TOKEN);
			}
			throw new CustomException(ErrorCode.KAKAO_API_ERROR);
		} catch (RestClientException e) {
			throw new CustomException(ErrorCode.KAKAO_API_ERROR);
		}
	}

	// 카카오 API 응답 매핑을 위한 클래스들 (이전과 동일)
	public static class KakaoUserResponse {
		private Long id;
		private KakaoAccount kakao_account;

		// Getters and setters
		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public KakaoAccount getKakao_account() {
			return kakao_account;
		}

		public void setKakao_account(KakaoAccount kakao_account) {
			this.kakao_account = kakao_account;
		}
	}

	public static class KakaoAccount {
		private Profile profile;

		// Getters and setters
		public Profile getProfile() {
			return profile;
		}

		public void setProfile(Profile profile) {
			this.profile = profile;
		}
	}

	public static class Profile {
		private String nickname;

		// Getters and setters
		public String getNickname() {
			return nickname;
		}

		public void setNickname(String nickname) {
			this.nickname = nickname;
		}
	}
}