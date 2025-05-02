import React from 'react';
import { Image, Dimensions, StatusBar, StyleSheet } from 'react-native';
import { View, Text, SafeAreaView } from 'react-native-elements';
import { Button } from '../components/ui';
import { useGuideSteps } from '../hooks/useGuideSteps';
import { useTheme } from 'react-native-elements';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.mainContainer}>
            <View style={styles.imageWrapper}>
              <View style={styles.imageContainer}>
                {currentStep === 0 ? (
                  <>
                    <Image
                      source={require('../assets/images/giftbox1.png')}
                      style={[styles.giftbox1]}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../assets/images/giftbox2.png')}
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
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.black }]}>
                {currentContent.title}
              </Text>
              <Text style={[styles.subText, { color: theme.colors.grey5 }]}>
                {currentContent.subText1}
              </Text>
              {currentContent.subText2 ? (
                <Text style={[styles.subText, { color: theme.colors.grey5 }]}>
                  {currentContent.subText2}
                </Text>
              ) : null}
            </View>

            <View style={styles.indicatorContainer}>
              {[...Array(totalSteps)].map((_, index) => (
                <View
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
            </View>
          </View>

          <Button
            title={isLastStep ? '시작하기' : '다음'}
            onPress={handleNext}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
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
    width: '100%',
  },
});

export default GuideFirstScreen;
