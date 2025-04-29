// 앱 테마 색상 정의
const colors = {
  // 메인 색상
  primary: '#56AEE9',
  secondary: '#278CCC',
  tertiary: '#A7DAF9',

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

  // 상태 색상
  success: '#68DB7D',
  warning: '#FCE642',
  danger: '#DC3545',
  info: '#17A2B8',

  // 경계 색상
  border: '#718096',
  borderLight: '#E2E8F0',
  borderDark: '#2D3748',

  // 비활성화 색상
  disabled: '#A7DAF94D',
  disabledText: '#278CCC',

  // 카드 색상
  card: {
    orange: '#FF9500',
    green: '#0DBA39',
    purple: '#AF52DE',
    blue: '#007AFF',
    cyan: '#30B0C7',
    pink: '#FF2DC3',
    // 비활성화 색상 (20%, 40% 투명도)
    orangeDisabled20: '#FF950033',
    orangeDisabled40: '#FF950066',
    greenDisabled20: '#0DBA3933',
    greenDisabled40: '#0DBA3966',
    purpleDisabled20: '#AF52DE33',
    purpleDisabled40: '#AF52DE66',
    blueDisabled20: '#007AFF33',
    blueDisabled40: '#007AFF66',
    cyanDisabled20: '#30B0C733',
    cyanDisabled40: '#30B0C766',
    pinkDisabled20: '#FF2DC333',
    pinkDisabled40: '#FF2DC366',
  },

  // 소셜 로그인 색상
  social: {
    kakao: '#FCE642',
    kakaoText: '#462000',
    google: '#EF4040',
    googleText: '#FFFFFF',
  },

  // 특수 색상
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // 다크 모드 지원 색상 (향후 확장)
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#56AEE9',
    text: '#E0E0E0',
  },
};

export default colors;
