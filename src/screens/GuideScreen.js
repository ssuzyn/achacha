import React from 'react';
import {
  Image,
  Dimensions,
  StatusBar,
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  SafeAreaView as RNSafeAreaView,
} from 'react-native';
import { useGuideSteps } from '../hooks/useGuideSteps';

const { width } = Dimensions.get('window');

// 색상 상수 정의
const COLORS = {
  primary: '#56AEE9',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  disabled: '#A7DAF94D',
};

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();

  return (
    <RNView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <RNSafeAreaView style={{ flex: 1 }}>
        <RNView
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingVertical: 28,
            justifyContent: 'space-between',
          }}
        >
          <RNView
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <RNView style={{ width: '100%', alignItems: 'center' }}>
              <RNView
                style={{
                  width: '100%',
                  alignItems: 'center',
                  minHeight: width * 0.6,
                  marginBottom: 8,
                }}
              >
                {currentStep === 0 ? (
                  <>
                    <Image
                      source={require('../../assets/giftbox1.png')}
                      style={{
                        width: width * 0.5,
                        height: width * 0.5,
                        position: 'absolute',
                        transform: [{ translateX: -80 }, { translateY: 50 }],
                      }}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../../assets/giftbox2.png')}
                      style={{
                        width: width * 0.5,
                        height: width * 0.5,
                        position: 'absolute',
                        transform: [{ translateX: 80 }, { translateY: -width * 0.1 }],
                      }}
                      resizeMode="contain"
                    />
                  </>
                ) : (
                  <Image
                    source={currentContent.image}
                    style={{
                      width: width * 0.6,
                      height: width * 0.6,
                      ...(currentContent.imageStyle || {}),
                    }}
                    resizeMode="contain"
                  />
                )}
              </RNView>
            </RNView>

            <RNView
              style={{
                width: '100%',
                alignItems: 'center',
                paddingBottom: 24,
                marginTop: 8,
                minHeight: 100,
              }}
            >
              <RNText
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: COLORS.text,
                  textAlign: 'center',
                }}
              >
                {currentContent.title}
              </RNText>
              <RNText
                style={{
                  fontSize: 16,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  lineHeight: 24,
                  marginTop: 8,
                }}
              >
                {currentContent.subText1}
              </RNText>
              {currentContent.subText2 ? (
                <RNText
                  style={{
                    fontSize: 16,
                    color: COLORS.textSecondary,
                    textAlign: 'center',
                    lineHeight: 24,
                    marginTop: 8,
                  }}
                >
                  {currentContent.subText2}
                </RNText>
              ) : null}
            </RNView>

            <RNView
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                marginTop: 24,
                position: 'absolute',
                bottom: 80,
              }}
            >
              {[...Array(totalSteps)].map((_, index) => (
                <RNView
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === currentStep ? COLORS.primary : COLORS.disabled,
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </RNView>
          </RNView>

          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={handleNext}
          >
            <RNText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {isLastStep ? '시작하기' : '다음'}
            </RNText>
          </TouchableOpacity>
        </RNView>
      </RNSafeAreaView>
    </RNView>
  );
};

export default GuideFirstScreen;
