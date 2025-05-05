import React from 'react';
import { Image, Dimensions, StatusBar, StyleSheet, View, SafeAreaView } from 'react-native';
import { Button, Text } from '../components/ui';
import { useGuideSteps } from '../hooks/useGuideSteps';
import { useTheme } from 'react-native-elements';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.mainContainer}>
            <View style={styles.imageWrapper}>
              <View style={styles.imageContainer}>
                <Image
                  source={currentContent.image}
                  style={[styles.contentImage, currentContent.imageStyle]}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.text}>{currentContent.title}</Text>
              <Text style={styles.text}>{currentContent.subText1}</Text>
              {currentContent.subText2 ? (
                <Text style={styles.text}>{currentContent.subText2}</Text>
              ) : null}
            </View>

            <View style={styles.indicatorContainer}>
              {[...Array(totalSteps)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: index === currentStep ? theme.colors.primary : '#e0e0e0',
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
    marginBottom: 30,
  },
  contentImage: {
    width: width * 0.6,
    height: width * 0.6,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 24,
    marginTop: 20,
    minHeight: 100,
  },
  text: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 26,
    marginBottom: 4,
    color: '#000000',
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
