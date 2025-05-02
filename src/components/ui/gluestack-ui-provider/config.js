import { vars } from '@gluestack-ui/themed';

// Theme colors - 테마 색상 정의
const colors = {
  primary: '#56AEE9',
  secondary: '#278CCC',
  tertiary: '#A7DAF9',
  success: '#68DB7D',
  warning: '#FCE642',
  danger: '#DC3545',
  info: '#17A2B8',

  // 배경 색상
  background: '#FFFFFF',
  backgroundAlt: '#F8F9FA',
  backgroundDark: '#EEEEEE',

  // 텍스트 색상
  text: '#000000',
  textSecondary: '#666666',
  textLight: '#999999',
  textInverted: '#FFFFFF',

  // 버튼 색상
  buttonText: '#FFFFFF',
  buttonPrimary: '#56AEE9',
  buttonSecondary: '#278CCC',
  buttonTertiary: '#A7DAF9',
  buttonDanger: '#DC3545',
  buttonSuccess: '#68DB7D',

  // 기타 색상
  border: '#718096',
  borderLight: '#E2E8F0',
  borderDark: '#2D3748',
  disabled: '#A7DAF94D',
  disabledText: '#278CCC',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // 소셜 로그인 색상
  socialKakao: '#FCE642',
  socialKakaoText: '#462000',
  socialGoogle: '#EF4040',
  socialGoogleText: '#FFFFFF',

  // 카드 색상
  cardOrange: '#FF9500',
  cardGreen: '#0DBA39',
  cardPurple: '#AF52DE',
  cardBlue: '#007AFF',
  cardCyan: '#30B0C7',
  cardPink: '#FF2DC3',
};

// 다크모드 색상 설정
const darkColors = {
  ...colors,
  background: '#121212',
  backgroundAlt: '#1E1E1E',
  backgroundDark: '#333333',
  text: '#E0E0E0',
  textSecondary: '#AAAAAA',
  borderLight: '#2D3748',
  borderDark: '#E2E8F0',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Typography settings - 타이포그래피 설정
const typography = {
  fontWeights: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  fontSizes: {
    xs: '10',
    sm: '12',
    md: '14',
    lg: '16',
    xl: '18',
    '2xl': '20',
    '3xl': '24',
    '4xl': '28',
    custom: '80',
  },
  lineHeights: {
    xs: '16',
    sm: '18',
    md: '20',
    lg: '22',
    xl: '24',
    '2xl': '26',
    '3xl': '30',
    '4xl': '34',
  },
};

// Layout settings - 레이아웃 설정
const layout = {
  spacing: {
    none: '0',
    xs: '4',
    sm: '8',
    md: '12',
    lg: '16',
    xl: '24',
    '2xl': '32',
  },
  borderRadius: {
    none: '0',
    xs: '2',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  borderWidth: {
    none: '0',
    thin: '1',
    medium: '2',
    thick: '3',
    xThick: '4',
  },
};

// 라이트 모드 변수 생성
const generateLightVars = () => {
  const lightVars = {};

  // 색상 변수 설정
  Object.entries(colors).forEach(([key, value]) => {
    lightVars[`--color-${key}`] = value;
  });

  // 타이포그래피 변수 설정
  Object.entries(typography.fontWeights).forEach(([key, value]) => {
    lightVars[`--font-weight-${key}`] = value;
  });

  Object.entries(typography.fontSizes).forEach(([key, value]) => {
    lightVars[`--font-size-${key}`] = value;
  });

  Object.entries(typography.lineHeights).forEach(([key, value]) => {
    lightVars[`--line-height-${key}`] = value;
  });

  // 레이아웃 변수 설정
  Object.entries(layout.spacing).forEach(([key, value]) => {
    lightVars[`--spacing-${key}`] = value;
  });

  Object.entries(layout.borderRadius).forEach(([key, value]) => {
    lightVars[`--border-radius-${key}`] = value;
  });

  Object.entries(layout.borderWidth).forEach(([key, value]) => {
    lightVars[`--border-width-${key}`] = value;
  });

  return lightVars;
};

// 다크 모드 변수 생성
const generateDarkVars = () => {
  const darkVars = {};

  // 색상 변수 설정
  Object.entries(darkColors).forEach(([key, value]) => {
    darkVars[`--color-${key}`] = value;
  });

  // 타이포그래피 변수 설정 (다크모드에서도 동일)
  Object.entries(typography.fontWeights).forEach(([key, value]) => {
    darkVars[`--font-weight-${key}`] = value;
  });

  Object.entries(typography.fontSizes).forEach(([key, value]) => {
    darkVars[`--font-size-${key}`] = value;
  });

  Object.entries(typography.lineHeights).forEach(([key, value]) => {
    darkVars[`--line-height-${key}`] = value;
  });

  // 레이아웃 변수 설정 (다크모드에서도 동일)
  Object.entries(layout.spacing).forEach(([key, value]) => {
    darkVars[`--spacing-${key}`] = value;
  });

  Object.entries(layout.borderRadius).forEach(([key, value]) => {
    darkVars[`--border-radius-${key}`] = value;
  });

  Object.entries(layout.borderWidth).forEach(([key, value]) => {
    darkVars[`--border-width-${key}`] = value;
  });

  return darkVars;
};

const config = {
  light: generateLightVars(),
  dark: generateDarkVars(),
  // tailwind와 통합하기 위한 참조 내보내기
  colors,
  darkColors,
  typography,
  layout,
};

export { config };
