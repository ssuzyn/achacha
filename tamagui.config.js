import { createTamagui } from 'tamagui';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/theme-base';

const appConfig = createTamagui({
  themes,
  tokens,
  shorthands,
  
  // 앱에 필요한 사용자 정의 색상 및 테마
  themeBuilder: {
    // 메인 색상
    primary: '#56AEE9',
    // 강조 색상
    accent: '#278CCC',
    // 비활성화, 백 색상
    background: '#A7DAF9',
    // 하단 탭 및 보더 색상
    border: '#718096',
    // 텍스트 색상
    textBlack: '#000000',
    textWhite: '#FFFFFF',
    textBrown: '#462000',
    // 카드 색상
    cardOrange: '#FF9500',
    cardGreen: '#0DBA3F',
    cardPurple: '#AF52DE',
    cardBlue: '#007AFF',
    cardTeal: '#30B0C7',
    cardPink: '#FF2DC3',
    // 로그인 버튼 색상
    loginYellow: '#FCE642',
    loginRed: '#EF4040',
  },
});

export default appConfig; 