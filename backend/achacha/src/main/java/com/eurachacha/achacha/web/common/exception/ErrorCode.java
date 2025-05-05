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
	UNAUTHORIZED_GIFTICON_ACCESS(HttpStatus.FORBIDDEN, "GIFTICON_002", "해당 기프티콘에 접근 권한이 없습니다.");

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
