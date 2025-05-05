// src/main/java/com/eurachacha/achacha/infrastructure/adapter/output/ocr/ClovaOcrAdapter.java
package com.eurachacha.achacha.infrastructure.adapter.output.ocr;

import java.io.IOException;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.infrastructure.config.ClovaOcrProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClovaOcrAdapter implements OcrPort {

	private final ClovaOcrProperties properties;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Override
	public String extractRawOcrResult(MultipartFile image) {
		try {
			// 1. HTTP 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			headers.set("X-OCR-SECRET", properties.getSecretKey());

			// 2. 요청 메시지 생성 (Jackson 사용)
			String message = createRequestMessage(image.getOriginalFilename());

			// 3. MultipartFile을 MultiValueMap으로 구성
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("message", message);
			body.add("file", createFileResource(image));

			// 4. HTTP 요청 객체 생성
			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			// 5. API 호출 및 결과 반환
			ResponseEntity<String> response = restTemplate.exchange(
				properties.getApiUrl(),
				HttpMethod.POST,
				requestEntity,
				String.class
			);

			// OCR 결과 로깅
			String ocrResult = response.getBody();
			// 			// OCR 결과 로깅
			try {
				JsonNode jsonNode = objectMapper.readTree(ocrResult);
				log.info("OCR 결과: {}",
					objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode));
			} catch (Exception e) {
				log.warn("OCR 결과 출력 실패", e);
			}

			return ocrResult;
		} catch (IOException e) {
			log.error("OCR 처리 실패", e);
			throw new RuntimeException("OCR 처리 중 오류가 발생했습니다.", e);
		}
	}

	private String createRequestMessage(String filename) {
		String fileFormat = getFileFormat(filename);
		String requestId = UUID.randomUUID().toString();
		long timestamp = System.currentTimeMillis();

		// Jackson을 사용하여 JSON 객체 생성
		ObjectNode messageNode = objectMapper.createObjectNode();
		messageNode.put("version", "V2");
		messageNode.put("requestId", requestId);
		messageNode.put("timestamp", timestamp);
		messageNode.put("lang", "ko");

		ArrayNode imagesArray = messageNode.putArray("images");
		ObjectNode imageNode = imagesArray.addObject();
		imageNode.put("format", fileFormat);
		imageNode.put("name", filename);

		messageNode.put("enableTableDetection", false);

		try {
			return objectMapper.writeValueAsString(messageNode);
		} catch (Exception e) {
			log.error("JSON 변환 실패", e);
			throw new RuntimeException("JSON 변환 중 오류가 발생했습니다.", e);
		}
	}

	private String getFileFormat(String filename) {
		int lastDotIndex = filename.lastIndexOf('.');
		if (lastDotIndex > 0) {
			return filename.substring(lastDotIndex + 1).toLowerCase();
		}
		return "jpg";
	}

	private ByteArrayResource createFileResource(final MultipartFile file) throws IOException {
		return new ByteArrayResource(file.getBytes()) {
			@Override
			public String getFilename() {
				return file.getOriginalFilename();
			}
		};
	}
}