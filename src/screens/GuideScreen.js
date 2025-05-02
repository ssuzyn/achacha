import React from 'react';
import {
  Image,
  Dimensions,
  StatusBar,
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  SafeAreaView as RNSafeAreaView,
  StyleSheet,
} from 'react-native';
import { useGuideSteps } from '../hooks/useGuideSteps';
import { useTheme } from 'react-native-elements';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();
  const { theme } = useTheme();

  return (
    <RNView style={[styles.container, { backgroundColor: theme.colors.white }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <RNSafeAreaView style={styles.safeArea}>
        <RNView style={styles.content}>
          <RNView style={styles.mainContainer}>
            <RNView style={styles.imageWrapper}>
              <RNView style={styles.imageContainer}>
                {currentStep === 0 ? (
                  <>
                    <Image
                      source={require('../../assets/images/giftbox1.png')}
                      style={[styles.giftbox1]}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../../assets/images/giftbox2.png')}
                      style={[styles.giftbox2]}
                      resizeMode="contain"
                    />
                  </>
                ) : (
                  <Image
                    source={currentContent.image}
                    style={[styles.contentImage, currentContent.imageStyle]}
                    resizeMode="contain"
                  />
                )}
              </RNView>
            </RNView>

            <RNView style={styles.textContainer}>
              <RNText style={[styles.title, { color: theme.colors.black }]}>
                {currentContent.title}
              </RNText>
              <RNText style={[styles.subText, { color: theme.colors.grey5 }]}>
                {currentContent.subText1}
              </RNText>
              {currentContent.subText2 ? (
                <RNText style={[styles.subText, { color: theme.colors.grey5 }]}>
                  {currentContent.subText2}
                </RNText>
              ) : null}
            </RNView>

            <RNView style={styles.indicatorContainer}>
              {[...Array(totalSteps)].map((_, index) => (
                <RNView
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor:
                        index === currentStep
                          ? theme.colors.primary
                          : `${theme.colors.background}4D`,
                    },
                  ]}
                />
              ))}
            </RNView>
          </RNView>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
          >
            <RNText style={[styles.buttonText, { color: theme.colors.white }]}>
              {isLastStep ? '시작하기' : '다음'}
            </RNText>
          </TouchableOpacity>
        </RNView>
      </RNSafeAreaView>
    </RNView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'space-between',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: width * 0.6,
    marginBottom: 8,
  },
  giftbox1: {
    width: width * 0.5,
    height: width * 0.5,
    position: 'absolute',
    transform: [{ translateX: -80 }, { translateY: 50 }],
  },
  giftbox2: {
    width: width * 0.5,
    height: width * 0.5,
    position: 'absolute',
    transform: [{ translateX: 80 }, { translateY: -width * 0.1 }],
  },
  contentImage: {
    width: width * 0.6,
    height: width * 0.6,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 24,
    marginTop: 8,
    minHeight: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 24,
    position: 'absolute',
    bottom: 80,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GuideFirstScreen;
