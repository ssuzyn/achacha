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
import { config } from '../components/ui/gluestack-ui-provider';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={config.light['--color-background']} />
      <View style={styles.container}>
        <View style={styles.mainContentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
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

          <View style={styles.content}>
            <Text style={styles.titleText}>{currentContent.title}</Text>
            <Text style={styles.subText}>{currentContent.subText1}</Text>
            {currentContent.subText2 ? (
              <Text style={styles.subText}>{currentContent.subText2}</Text>
            ) : null}
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
    backgroundColor: config.light['--color-background'],
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: parseInt(config.light['--spacing-xl']),
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
    marginBottom: parseInt(config.light['--spacing-sm']),
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
    paddingBottom: parseInt(config.light['--spacing-lg']),
    marginTop: parseInt(config.light['--spacing-sm']),
    minHeight: 100,
  },
  titleText: {
    fontSize: parseInt(config.light['--font-size-3xl']),
    fontWeight: config.light['--font-weight-bold'],
    color: config.light['--color-text'],
    textAlign: 'center',
    marginBottom: parseInt(config.light['--spacing-sm']),
  },
  subText: {
    fontSize: parseInt(config.light['--font-size-lg']),
    fontWeight: config.light['--font-weight-regular'],
    color: config.light['--color-text-secondary'],
    textAlign: 'center',
    lineHeight: 28,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: parseInt(config.light['--spacing-xl']),
    position: 'absolute',
    bottom: 80,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonWrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: config.light['--color-primary-400'],
    paddingVertical: 15,
    borderRadius: parseInt(config.light['--border-radius-md']),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: parseInt(config.light['--font-size-lg']),
    fontWeight: config.light['--font-weight-medium'],
    color: config.light['--color-button-text'],
  },
});

export default GuideFirstScreen;
