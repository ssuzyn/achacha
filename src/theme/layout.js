// 앱 전역 레이아웃 설정
export const layout = {
  // 컨테이너 패딩
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // 스크린 전체 패딩
  screen: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // 섹션 패딩
  section: {
    paddingVertical: 10,
  },
  // 최대 너비 설정
  maxWidth: {
    default: '100%',
    content: 400, // 콘텐츠 영역 최대 너비
  },
  // 간격 설정
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  // 카드 스타일
  card: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  // 입력 필드 스타일
  input: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  // 버튼 스타일
  button: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  // 헤더 설정
  header: {
    height: 56,
    paddingHorizontal: 16,
  },
  // 하단 탭바 설정
  tabBar: {
    height: 60,
  },
  // 이미지 크기
  imageSize: {
    small: 48,
    medium: 80,
    large: 150,
  }
};

export default layout;
