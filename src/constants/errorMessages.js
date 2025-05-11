// 인증 관련 에러 메시지
export const AUTH_ERROR_MESSAGES = {
  AUTH_01: '유효하지 않은 토큰입니다.',
  AUTH_02: '만료된 토큰입니다.',
  AUTH_03: '사용자를 찾을 수 없습니다.',
  AUTH_04: '카카오 API 호출 중 오류가 발생했습니다.',
  AUTH_05: '토큰 정보가 일치하지 않습니다.',
  AUTH_06: '유효하지 않은 리프레시 토큰입니다.',
};

// 파일 관련 에러 메시지
export const FILE_ERROR_MESSAGES = {
  FILE_001: '파일이 비어있습니다.',
  FILE_002: '파일 크기가 제한을 초과했습니다.',
  FILE_003: '유효하지 않은 파일명입니다.',
  FILE_004: '지원하지 않는 파일 형식입니다.',
  FILE_005: '유효하지 않은 파일 MIME 타입입니다.',
  FILE_006: '파일 내용이 손상되었거나 유효하지 않습니다.',
  FILE_007: '파일 처리 중 오류가 발생했습니다.',
};

// OCR 관련 에러 메시지
export const OCR_ERROR_MESSAGES = {
  OCR_001: 'OCR 서비스 연결 중 오류가 발생했습니다.',
  OCR_002: 'OCR 서비스 응답 처리 중 오류가 발생했습니다.',
  OCR_003: '이미지 파일 처리 중 오류가 발생했습니다.',
  OCR_004: 'OCR 요청 JSON 생성 중 오류가 발생했습니다.',
};

// AI 관련 에러 메시지
export const AI_ERROR_MESSAGES = {
  AI_001: 'AI 서비스 연결 중 오류가 발생했습니다.',
  AI_002: 'AI 서비스 응답 처리 중 오류가 발생했습니다.',
  AI_003: 'AI 서비스 응답이 비어있습니다.',
  AI_004: 'AI 서비스 응답 파싱 중 오류가 발생했습니다.',
};

// 기프티콘 관련 에러 메시지
export const GIFTICON_ERROR_MESSAGES = {
  GIFTICON_006: '금액형 기프티콘은 금액을 입력해야 합니다.',
  GIFTICON_007: '이미 등록된 바코드 번호입니다.',
};

// 브랜드 및 쉐어박스 관련 에러 메시지
export const RESOURCE_ERROR_MESSAGES = {
  BRAND_001: '브랜드 정보를 찾을 수 없습니다.',
  SHAREBOX_001: '쉐어박스를 찾을 수 없습니다.',
};

// S3 및 서버 관련 에러 메시지
export const SERVER_ERROR_MESSAGES = {
  S3_001: '파일 업로드 중 오류가 발생했습니다.',
  X002: '잘못된 파라미터가 전달되었습니다.',
  X003: '서버 에러가 발생했습니다.',
};

// 모든 에러 메시지를 하나의 객체로 합침
export const ERROR_MESSAGES = {
  ...AUTH_ERROR_MESSAGES,
  ...FILE_ERROR_MESSAGES,
  ...OCR_ERROR_MESSAGES,
  ...AI_ERROR_MESSAGES,
  ...GIFTICON_ERROR_MESSAGES,
  ...RESOURCE_ERROR_MESSAGES,
  ...SERVER_ERROR_MESSAGES,
};

// 기본 에러 메시지
export const DEFAULT_ERROR_MESSAGES = {
  400: '요청에 문제가 있습니다. 입력값을 확인해주세요.',
  401: '인증에 실패했습니다. 다시 로그인해주세요.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '요청이 충돌했습니다.',
  500: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  default: '알 수 없는 오류가 발생했습니다.',
};
