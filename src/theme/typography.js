import { Platform, PixelRatio, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 디바이스 화면 크기에 따른 스케일 계산
const scale = width / 375; // 기준 너비 (iPhone 8)

// 디바이스별 폰트 크기 조정 함수
export const normalize = size => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2; // Android에서는 약간 작게
};

// 폰트 가중치
export const fontWeights = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

// 제목 스타일 (대화면, 중간화면, 소화면)
export const headingStyles = {
  h1: {
    fontSize: normalize(28),
    fontWeight: fontWeights.bold,
    lineHeight: normalize(34),
  },
  h2: {
    fontSize: normalize(24),
    fontWeight: fontWeights.bold,
    lineHeight: normalize(30),
  },
  h3: {
    fontSize: normalize(20),
    fontWeight: fontWeights.semiBold,
    lineHeight: normalize(26),
  },
  h4: {
    fontSize: normalize(18),
    fontWeight: fontWeights.semiBold,
    lineHeight: normalize(24),
  },
  h5: {
    fontSize: normalize(16),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(22),
  },
  h6: {
    fontSize: normalize(14),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(20),
  },
};

// 본문 텍스트 스타일
export const bodyStyles = {
  large: {
    fontSize: normalize(16),
    fontWeight: fontWeights.regular,
    lineHeight: normalize(24),
  },
  medium: {
    fontSize: normalize(14),
    fontWeight: fontWeights.regular,
    lineHeight: normalize(22),
  },
  small: {
    fontSize: normalize(12),
    fontWeight: fontWeights.regular,
    lineHeight: normalize(18),
  },
  xsmall: {
    fontSize: normalize(10),
    fontWeight: fontWeights.regular,
    lineHeight: normalize(16),
  },
};

// 버튼 텍스트 스타일
export const buttonStyles = {
  large: {
    fontSize: normalize(18),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(24),
  },
  medium: {
    fontSize: normalize(16),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(22),
  },
  small: {
    fontSize: normalize(14),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(20),
  },
};

// 라벨 스타일
export const labelStyles = {
  large: {
    fontSize: normalize(14),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(20),
  },
  medium: {
    fontSize: normalize(12),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(18),
  },
  small: {
    fontSize: normalize(10),
    fontWeight: fontWeights.medium,
    lineHeight: normalize(16),
  },
};

// 특별 텍스트 스타일 (알림, 강조 등)
export const specialStyles = {
  notification: {
    fontSize: normalize(12),
    fontWeight: fontWeights.bold,
    lineHeight: normalize(18),
  },
  caption: {
    fontSize: normalize(11),
    fontWeight: fontWeights.regular,
    lineHeight: normalize(16),
  },
  highlight: {
    fontSize: normalize(16),
    fontWeight: fontWeights.bold,
    lineHeight: normalize(22),
  },
  price: {
    fontSize: normalize(18),
    fontWeight: fontWeights.bold,
    lineHeight: normalize(24),
  },
};

// 유동적 폰트 크기 조정을 위한 스케일 정의
export const fontScale = {
  extraSmall: 0.8, // 매우 작은 화면
  small: 0.9, // 작은 화면
  normal: 1.0, // 일반 화면
  large: 1.1, // 큰 화면
  extraLarge: 1.2, // 매우 큰 화면
};

// 디바이스 너비에 따라 적절한 스케일 결정
export const getResponsiveFontScale = () => {
  if (width < 320) return fontScale.extraSmall;
  if (width < 375) return fontScale.small;
  if (width < 414) return fontScale.normal;
  if (width < 768) return fontScale.large;
  return fontScale.extraLarge;
};

// 모바일 환경에 유동적으로 대응하는 폰트 크기 설정 함수
export const responsiveFont = baseSize => {
  const fontScale = getResponsiveFontScale();
  return normalize(baseSize * fontScale);
};

// 기본 typograpy 설정 익스포트
export default {
  fontWeights,
  headingStyles,
  bodyStyles,
  buttonStyles,
  labelStyles,
  specialStyles,
  normalize,
  responsiveFont,
};
