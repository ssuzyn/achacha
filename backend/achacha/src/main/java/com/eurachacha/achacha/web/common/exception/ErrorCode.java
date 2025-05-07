package com.eurachacha.achacha.web.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
	EXAMPLE_NOT_FOUND(HttpStatus.NOT_FOUND, "X001", "예제 에러 코드입니다"),
	INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "X002", "잘못된 파라미터가 전달되었습니다."),
	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "X003", "서버 에러가 발생했습니다."),

	// 기프티콘 관련 에러 코드
	GIFTICON_NOT_FOUND(HttpStatus.NOT_FOUND, "GIFTICON_001", "기프티콘 정보를 찾을 수 없습니다,"),
	UNAUTHORIZED_GIFTICON_ACCESS(HttpStatus.FORBIDDEN, "GIFTICON_002", "해당 기프티콘에 접근 권한이 없습니다."),

	// AI 서비스 관련 에러 코드
	AI_SERVICE_CONNECTION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_001", "AI 서비스 연결 중 오류가 발생했습니다."),
	AI_SERVICE_RESPONSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_002", "AI 서비스 응답 처리 중 오류가 발생했습니다."),
	AI_SERVICE_EMPTY_RESPONSE(HttpStatus.BAD_GATEWAY, "AI_003", "AI 서비스 응답이 비어있습니다."),
	AI_SERVICE_PARSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_004", "AI 서비스 응답 파싱 중 오류가 발생했습니다."),

	// OCR 서비스 관련 에러 코드
	OCR_SERVICE_CONNECTION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_001", "OCR 서비스 연결 중 오류가 발생했습니다."),
	OCR_SERVICE_RESPONSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_002", "OCR 서비스 응답 처리 중 오류가 발생했습니다."),
	OCR_FILE_PROCESSING_ERROR(HttpStatus.BAD_REQUEST, "OCR_003", "이미지 파일 처리 중 오류가 발생했습니다."),
	OCR_JSON_PROCESSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_004", "OCR 요청 JSON 생성 중 오류가 발생했습니다."),

	// S3 스토리지 관련 에러 코드
	S3_UPLOAD_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S3_001", "파일 업로드 중 오류가 발생했습니다."),
	S3_DELETE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S3_002", "파일 삭제 중 오류가 발생했습니다."),

	// 파일 검증 관련 에러 코드
	FILE_EMPTY(HttpStatus.BAD_REQUEST, "FILE_001", "파일이 비어있습니다."),
	FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "FILE_002", "파일 크기가 제한을 초과했습니다."),
	FILE_INVALID_NAME(HttpStatus.BAD_REQUEST, "FILE_003", "유효하지 않은 파일명입니다."),
	FILE_INVALID_EXTENSION(HttpStatus.BAD_REQUEST, "FILE_004", "지원하지 않는 파일 형식입니다."),
	FILE_INVALID_MIME_TYPE(HttpStatus.BAD_REQUEST, "FILE_005", "유효하지 않은 파일 MIME 타입입니다."),
	FILE_INVALID_CONTENT(HttpStatus.BAD_REQUEST, "FILE_006", "파일 내용이 손상되었거나 유효하지 않습니다."),
	FILE_PROCESSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_007", "파일 처리 중 오류가 발생했습니다."),

	// CloudFront 관련 에러 코드
	CLOUDFRONT_URL_GENERATION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "CF_001", "URL 생성 중 오류가 발생했습니다."),
	CLOUDFRONT_PRIVATE_KEY_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "CF_002", "CloudFront 인증 키 처리 중 오류가 발생했습니다."),
	CLOUDFRONT_SIGNED_URL_EXPIRED(HttpStatus.FORBIDDEN, "CF_003", "URL이 만료되었습니다.");

	// http 상태 코드
	private final HttpStatus status;
	// 커스텀 에러 코드
	private final String code;
	// 기본 에러 메시지
	private final String defaultMessage;

	ErrorCode(HttpStatus status, String code, String defaultMessage) {
		this.status = status;
		this.code = code;
		this.defaultMessage = defaultMessage;
	}
}