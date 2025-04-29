import React from 'react';
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
import { useGuideSteps } from '../hooks/useGuideSteps';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const {
    currentStep,
    currentContent,
    isLastStep,
    handleNext,
    totalSteps
  } = useGuideSteps();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.mainContentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
              {currentStep === 0 ? (
                <>
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
                  <Image
                    source={currentContent.image}
                    style={[styles.guideImage, currentContent.imageStyle]}
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
            {[...Array(totalSteps)].map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentStep ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{isLastStep ? '시작하기' : '다음'}</Text>
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
    minHeight: width * 0.6,
    marginBottom: 10,
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
  content: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 10,
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