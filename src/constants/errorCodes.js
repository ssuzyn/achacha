// 인증 관련 에러 코드
export const AUTH_ERRORS = {
  AUTH_01: 'AUTH_01', // 유효하지 않은 토큰
  AUTH_02: 'AUTH_02', // 만료된 토큰
  AUTH_03: 'AUTH_03', // 사용자를 찾을 수 없음
  AUTH_04: 'AUTH_04', // 카카오 API 호출 중 오류
  AUTH_05: 'AUTH_05', // 토큰 정보 불일치
  AUTH_06: 'AUTH_06', // 유효하지 않은 리프레시 토큰
};

// 파일 관련 에러 코드
export const FILE_ERRORS = {
  FILE_001: 'FILE_001', // 파일이 비어있음
  FILE_002: 'FILE_002', // 파일 크기 제한 초과
  FILE_003: 'FILE_003', // 유효하지 않은 파일명
  FILE_004: 'FILE_004', // 지원하지 않는 파일 형식
  FILE_005: 'FILE_005', // 유효하지 않은 파일 MIME 타입
  FILE_006: 'FILE_006', // 파일 내용 손상 또는 유효하지 않음
  FILE_007: 'FILE_007', // 파일 처리 중 오류
};

// OCR 관련 에러 코드
export const OCR_ERRORS = {
  OCR_001: 'OCR_001', // OCR 서비스 연결 중 오류
  OCR_002: 'OCR_002', // OCR 서비스 응답 처리 중 오류
  OCR_003: 'OCR_003', // 이미지 파일 처리 중 오류
  OCR_004: 'OCR_004', // OCR 요청 JSON 생성 중 오류
};

// AI 관련 에러 코드
export const AI_ERRORS = {
  AI_001: 'AI_001', // AI 서비스 연결 중 오류
  AI_002: 'AI_002', // AI 서비스 응답 처리 중 오류
  AI_003: 'AI_003', // AI 서비스 응답이 비어있음
  AI_004: 'AI_004', // AI 서비스 응답 파싱 중 오류
};

// 기프티콘 관련 에러 코드
export const GIFTICON_ERRORS = {
  GIFTICON_006: 'GIFTICON_006', // 금액형 기프티콘은 금액을 입력해야 함
  GIFTICON_007: 'GIFTICON_007', // 이미 등록된 바코드 번호
};

// 브랜드 및 쉐어박스 관련 에러 코드
export const RESOURCE_ERRORS = {
  BRAND_001: 'BRAND_001', // 브랜드 정보를 찾을 수 없음
  SHAREBOX_001: 'SHAREBOX_001', // 쉐어박스를 찾을 수 없음
};

// S3 및 서버 관련 에러 코드
export const SERVER_ERRORS = {
  S3_001: 'S3_001', // 파일 업로드 중 오류
  X002: 'X002', // 잘못된 파라미터가 전달됨
  X003: 'X003', // 서버 에러가 발생함
};

// 모든 에러 코드를 하나의 객체로 합침
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...FILE_ERRORS,
  ...OCR_ERRORS,
  ...AI_ERRORS,
  ...GIFTICON_ERRORS,
  ...RESOURCE_ERRORS,
  ...SERVER_ERRORS,
};

// HTTP 상태 코드에 따른 에러 코드 매핑
export const HTTP_STATUS_ERROR_MAP = {
  400: [
    ...Object.values(FILE_ERRORS).filter(code => code !== FILE_ERRORS.FILE_007),
    GIFTICON_ERRORS.GIFTICON_006,
    SERVER_ERRORS.X002,
  ],
  401: [AUTH_ERRORS.AUTH_01, AUTH_ERRORS.AUTH_02, AUTH_ERRORS.AUTH_05, AUTH_ERRORS.AUTH_06],
  404: [AUTH_ERRORS.AUTH_03, RESOURCE_ERRORS.BRAND_001, RESOURCE_ERRORS.SHAREBOX_001],
  409: [GIFTICON_ERRORS.GIFTICON_007],
  500: [
    OCR_ERRORS.OCR_001,
    OCR_ERRORS.OCR_002,
    OCR_ERRORS.OCR_004,
    AI_ERRORS.AI_001,
    AI_ERRORS.AI_002,
    AI_ERRORS.AI_004,
    FILE_ERRORS.FILE_007,
    SERVER_ERRORS.S3_001,
    SERVER_ERRORS.X003,
  ],
  502: [AI_ERRORS.AI_003],
};
