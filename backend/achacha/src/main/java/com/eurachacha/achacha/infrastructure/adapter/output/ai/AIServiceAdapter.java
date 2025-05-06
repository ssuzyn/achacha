package com.eurachacha.achacha.infrastructure.adapter.output.ai;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.output.ai.AIServicePort;
import com.eurachacha.achacha.infrastructure.config.AIServiceProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AIServiceAdapter implements AIServicePort {

	private final AIServiceProperties properties;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Override
	public GifticonMetadataResponseDto extractGifticonInfo(String ocrResult, String gifticonType) {
		try {
			log.info("AI 서비스 처리 시작 - 기프티콘 타입: {}", gifticonType);

			// 1. HTTP 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			// 2. 요청 본문 구성 (Jackson 사용)
			ObjectNode requestNode = objectMapper.createObjectNode();
			requestNode.put("ocrResult", ocrResult);
			requestNode.put("gifticonType", gifticonType);

			String requestBody = objectMapper.writeValueAsString(requestNode);
			log.debug("AI 서비스 요청 본문: {}", requestBody);

			// 3. HTTP 요청 객체 생성
			HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

			// 4. AI 서비스 서버 호출
			String url = properties.getApiUrl() + "/api/extract-gifticon";
			ResponseEntity<String> response = restTemplate.exchange(
				url,
				HttpMethod.POST,
				requestEntity,
				String.class
			);

			// 5. 응답 로깅 및 검증
			String responseBody = response.getBody();
			log.info("AI 서비스 응답: {}", responseBody);  // debug -> info로 변경

			if (responseBody == null || responseBody.trim().isEmpty()) {
				log.error("AI 서비스 응답이 비어있습니다.");
				throw new RuntimeException("AI 서비스 응답이 비어있습니다.");
			}

			// 6. 응답 파싱 및 DTO 변환
			return parseResponse(responseBody);
		} catch (Exception e) {
			log.error("AI 서비스 처리 실패", e);
			throw new RuntimeException("기프티콘 정보 추출 중 오류가 발생했습니다.", e);
		}
	}

	private GifticonMetadataResponseDto parseResponse(String responseBody) throws Exception {
		JsonNode rootNode = objectMapper.readTree(responseBody);

		return GifticonMetadataResponseDto.builder()
			.gifticonBarcodeNumber(getNullableTextValue(rootNode, "gifticonBarcodeNumber"))
			.brandName(getNullableTextValue(rootNode, "brandName"))
			.gifticonName(getNullableTextValue(rootNode, "gifticonName"))
			.gifticonExpiryDate(getNullableTextValue(rootNode, "gifticonExpiryDate"))
			.gifticonOriginalAmount(getIntegerValue(rootNode, "gifticonOriginalAmount"))
			.build();
	}

	private String getNullableTextValue(JsonNode node, String fieldName) {
		JsonNode fieldNode = node.get(fieldName);
		return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asText() : null;
	}

	private Integer getIntegerValue(JsonNode node, String fieldName) {
		JsonNode fieldNode = node.get(fieldName);
		return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asInt() : null;
	}
}
