import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const guideSteps = [
  // Step 1: 초기 화면
  {
    title: '아차차!',
    subText1: '또 기프티콘 유효기간을',
    subText2: '놓치셨다구요?',
    image: require('../assets/images/giftbox.png'),
    imageStyle: { width: width * 0.9, height: width * 0.9 },
  },
  // Step 2: 이미지 업로드
  {
    title: '이미지 업로드만으로 똑똑하게',
    subText1: '브랜드, 상품, 유효기간까지',
    subText2: '자동 인식',
    image: require('../assets/images/giftscan.png'),
    imageStyle: { width: width * 0.7, height: width * 0.7 },
  },
  // Step 3: 유효기간 알림
  {
    title: '유효기간 임박?',
    subText1: '원하는 시간에 똑똑하게',
    subText2: '알려드릴게요.',
    image: require('../assets/images/bell.png'),
    imageStyle: { width: width * 0.7, height: width * 0.7 },
  },
  // Step 4: 기프티콘 전달
  {
    title: '쓱- 하고 넘기면,',
    subText1: '기프티콘이 누군가에게 🎁',
    subText2: '',
    image: require('../assets/images/gesture.png'),
    imageStyle: { width: width * 0.7, height: width * 0.7 },
  },
  // Step 5: 쉐어박스
  {
    title: '연인도, 가족도, 친구도.',
    subText1: '모두 함께 쓰는 쉐어박스',
    subText2: '',
    image: require('../assets/images/share.png'),
  },
];
