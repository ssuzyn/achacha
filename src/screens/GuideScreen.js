import React from 'react';
import {
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useGuideSteps } from '../hooks/useGuideSteps';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.mainContent}>
            <View style={styles.imageContainer}>
              <View style={[styles.imageBox, { minHeight: width * 0.6, marginBottom: 8 }]}>
                {currentStep === 0 ? (
                  <>
                    <Image
                      source={require('../../assets/giftbox1.png')}
                      style={[
                        styles.giftboxImage,
                        { transform: [{ translateX: -80 }, { translateY: 50 }] },
                      ]}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../../assets/giftbox2.png')}
                      style={[
                        styles.giftboxImage,
                        { transform: [{ translateX: 80 }, { translateY: -width * 0.1 }] },
                      ]}
                      resizeMode="contain"
                    />
                  </>
                ) : (
                  <>
                    <Image
                      source={currentContent.image}
                      style={[styles.guideImage, currentContent.imageStyle]}
                      resizeMode="contain"
                    />
                  </>
                )}
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{currentContent.title}</Text>
              <Text style={styles.subText}>{currentContent.subText1}</Text>
              {currentContent.subText2 ? (
                <Text style={styles.subText}>{currentContent.subText2}</Text>
              ) : null}
            </View>

            <View style={styles.indicatorContainer}>
              {[...Array(totalSteps)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    { backgroundColor: index === currentStep ? '#56AEE9' : '#A7DAF94D' },
                  ]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{isLastStep ? '시작하기' : '다음'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imageBox: {
    width: '100%',
    alignItems: 'center',
  },
  giftboxImage: {
    width: width * 0.5,
    height: width * 0.5,
    position: 'absolute',
  },
  guideImage: {
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
    color: '#000000',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 28,
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
    backgroundColor: '#56AEE9',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GuideFirstScreen;
