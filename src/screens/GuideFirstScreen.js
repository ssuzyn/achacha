import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { markAppAsLaunched } from '../utils/appStorage';

const { width } = Dimensions.get('window');

// 각 단계별 콘텐츠 정의 (이미지 및 문구 업데이트)
const guideSteps = [
  // Step 1: 초기 화면 (기존 유지)
  { title: '아차차!', subText1: '또 기프티콘 유효기간을', subText2: '놓치셨다구요?', image: require('../../assets/giftbox1.png') }, // 첫 화면 이미지는 조건부 렌더링으로 처리되므로 이 경로는 사용되지 않음
  // Step 2: 이미지 업로드 (Image 1 내용)
  { title: '이미지 업로드만으로 똑똑하게', subText1: '브랜드, 상품, 유효기간까지', subText2: '자동 인식', image: require('../../assets/giftscan.png') }, // 이미지 경로 예시, 실제 파일로 수정 필요
  // Step 3: 유효기간 알림 (Image 2 내용)
  { title: '유효기간 임박?', subText1: '원하는 시간에 똑똑하게', subText2: '알려드릴게요.', image: require('../../assets/bell.png') }, // 이미지 경로 예시, 실제 파일로 수정 필요
  // Step 4: 기프티콘 전달 (Image 3 내용)
  { title: '쓱- 하고 넘기면,', subText1: '기프티콘이 누군가에게 🎁', subText2: '', image: require('../../assets/gesture.png') }, // 이미지 경로 예시, 실제 파일로 수정 필요
  // Step 5: 쉐어박스 (Image 4 내용)
  { title: '연인도, 가족도, 친구도.', subText1: '모두 함께 쓰는 쉐어박스', subText2: '', image: require('../../assets/share.png') }, // 이미지 경로 예시, 실제 파일로 수정 필요
];

const GuideFirstScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0); // 현재 단계 상태 추가

  const handleNext = async () => { // 함수 이름 변경 및 로직 수정
    if (currentStep < guideSteps.length - 1) {
      // 다음 단계로 이동
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 Permission 화면으로 이동
      try {
        await markAppAsLaunched();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Permission' }],
          })
        );
      } catch (error) {
        console.error('네비게이션 오류 (GuideFirstScreen):', error);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Permission' }], // Fallback navigation
          })
        );
      }
    }
  };

  // 현재 단계에 맞는 콘텐츠 가져오기
  const currentContent = guideSteps[currentStep];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.mainContentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
              {/* 현재 단계에 따라 이미지 조건부 렌더링 */}
              {currentStep === 0 ? (
                <>
                  {/* 첫 단계: 기존 선물 상자 이미지 두 개 표시 */}
                  <Image
                    source={require('../../assets/giftbox1.png')}
                    style={[styles.giftboxImage, { transform: [{ translateX: -80 }, { translateY: 50 }]}]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('../../assets/giftbox2.png')}
                    style={[styles.giftboxImage, { transform: [{ translateX: 80 }, { translateY: -width * 0.1 } ]}]}
                    resizeMode="contain"
                  />
                </>
              ) : (
                <> 
                  {/* 첫 단계 이후: 현재 단계의 이미지 표시 */}
                  <Image
                    source={currentContent.image} // 동적으로 이미지 소스 변경
                    style={styles.guideImage} // 이미지 스타일 적용 (새로운 스타일)
                    resizeMode="contain"
                  />
                </>
              )}
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.titleText}>{currentContent.title}</Text>
            <Text style={styles.subText}>{currentContent.subText1}</Text>
            {currentContent.subText2 ? <Text style={styles.subText}>{currentContent.subText2}</Text> : null}
          </View>

          <View style={styles.paginationContainer}>
            {guideSteps.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentStep ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{currentStep === guideSteps.length - 1 ? '시작하기' : '다음'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  mainContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: -50,
    minHeight: width * 0.6,
  },
  giftboxImage: {
    width: width * 0.5,
    height: width * 0.5,
    position: 'absolute',
  },
  guideImage: {
    width: width * 0.7,
    height: width * 0.7,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: width * 0.6 - 30,
    minHeight: 100,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'normal',
    textAlign: 'center',
    lineHeight: 28,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30,
    position: 'absolute',
    bottom: 80,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#56AEE9',
  },
  dotInactive: {
    backgroundColor: '#D3D3D3',
  },
  buttonWrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#56AEE9',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GuideFirstScreen; 