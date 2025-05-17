// 인증 관련 에러 코드
export const AUTH_ERRORS = {
  AUTH_01: 'AUTH_01', // 유효하지 않은 토큰
  AUTH_02: 'AUTH_02', // 만료된 토큰
  AUTH_03: 'AUTH_03', // 사용자를 찾을 수 없음
  AUTH_04: 'AUTH_04', // 카카오 API 호출 중 오류
  AUTH_05: 'AUTH_05', // 토큰 정보 불일치
  AUTH_06: 'AUTH_06', // 유효하지 않은 리프레시 토큰
  AUTH_08: 'AUTH_08', // 해당 사용자 정보에 접근할 권한이 없습니다 (신규 추가)
  AUTH_007: 'AUTH_007', // 인증되지 않은 사용자
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
  GIFTICON_002: 'GIFTICON_002', // 해당 기프티콘에 접근 권한이 없습니다. (신규 추가)
  GIFTICON_001: 'GIFTICON_001', // 기프티콘 정보를 찾을 수 없습니다. (신규 추가)
  GIFTICON_003: 'GIFTICON_003', // 기프티콘이 만료되었습니다. (신규 추가)
  GIFTICON_005: 'GIFTICON_005', // 삭제된 기프티콘입니다. (신규 추가)
};

// 브랜드 및 쉐어박스 관련 에러 코드
export const RESOURCE_ERRORS = {
  BRAND_001: 'BRAND_001', // 브랜드 정보를 찾을 수 없음
  SHAREBOX_001: 'SHAREBOX_001', // 쉐어박스를 찾을 수 없음
};

// 쉐어박스 관련 에러 코드 (생성/참여 등)
export const SHAREBOX_ERRORS = {
  SHAREBOX_001: 'SHAREBOX_001', // 쉐어박스를 찾을 수 없음
  SHAREBOX_002: 'SHAREBOX_002', // 쉐어박스 생성에 실패했습니다.
  SHAREBOX_003: 'SHAREBOX_003', // 유효하지 않은 초대 코드입니다.
  SHAREBOX_004: 'SHAREBOX_004', // 참여가 비활성화된 쉐어박스입니다.
  SHAREBOX_005: 'SHAREBOX_005', // 이미 참여 중인 쉐어박스입니다.
  SHAREBOX_006: 'SHAREBOX_006', // 최대 참여자 수(10명)에 도달했습니다.
  SHAREBOX_007: 'SHAREBOX_007', // 유효하지 않은 쉐어박스 이름입니다.
  SHAREBOX_008: 'SHAREBOX_008', // 접근 권한 없음 (신규 추가)
  SHAREBOX_009: 'SHAREBOX_009', // 일부 사용된 금액형 기프티콘은 공유할 수 없음 (신규 추가)
  SHAREBOX_010: 'SHAREBOX_010', // 이미 공유된 기프티콘입니다 (신규 추가)
  SHAREBOX_012: 'SHAREBOX_012', // 해당 쉐어박스 방장만 접근 가능 (신규 추가)
};

// S3 및 서버 관련 에러 코드
export const SERVER_ERRORS = {
  S3_001: 'S3_001', // 파일 업로드 중 오류
  X002: 'X002', // 잘못된 파라미터가 전달됨
  X003: 'X003', // 서버 에러가 발생함
};

// 선물(카드) 관련 에러 코드
export const PRESENT_ERRORS = {
  PRESENT_001: 'PRESENT_001', // 선물 카드 템플릿 디자인을 찾을 수 없음
};

// 모든 에러 코드를 하나의 객체로 합침
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...FILE_ERRORS,
  ...OCR_ERRORS,
  ...AI_ERRORS,
  ...GIFTICON_ERRORS,
  ...RESOURCE_ERRORS,
  ...SHAREBOX_ERRORS,
  ...SERVER_ERRORS,
  ...PRESENT_ERRORS,
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
