package com.eurachacha.achacha.web.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    EXAMPLE_NOT_FOUND(HttpStatus.NOT_FOUND, "X001", "예제 에러 코드입니다"),
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "X002", "잘못된 파라미터가 전달되었습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "X003", "서버 에러가 발생했습니다.");

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
