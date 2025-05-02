import React from 'react';
import { Image, StyleSheet, StatusBar, Dimensions, SafeAreaView } from 'react-native';
import { useGuideSteps } from '../hooks/useGuideSteps';
import { Box, Text, VStack, HStack, Center, Button, ButtonText } from '@gluestack-ui/themed';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { currentStep, currentContent, isLastStep, handleNext, totalSteps } = useGuideSteps();

  return (
    <Box flex={1} bg="$background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <SafeAreaView style={styles.flex}>
        <Box flex={1} px="$6" pb="$7">
          <Box flex={1} justifyContent="center" alignItems="center" w="$full">
            <Box w="$full" alignItems="center">
              <Box w="$full" alignItems="center" minHeight={width * 0.6} mb="$2">
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
              </Box>
            </Box>

            <VStack space="$2" w="$full" alignItems="center" pb="$6" mt="$2" minHeight={100}>
              <Text fontSize="$3xl" fontWeight="$bold" color="$text" textAlign="center">
                {currentContent.title}
              </Text>
              <Text fontSize="$lg" color="$textSecondary" textAlign="center" lineHeight={28}>
                {currentContent.subText1}
              </Text>
              {currentContent.subText2 ? (
                <Text fontSize="$lg" color="$textSecondary" textAlign="center" lineHeight={28}>
                  {currentContent.subText2}
                </Text>
              ) : null}
            </VStack>

            <HStack justifyContent="center" w="$full" mt="$6" position="absolute" bottom={80}>
              {[...Array(totalSteps)].map((_, index) => (
                <Box
                  key={index}
                  w={8}
                  h={8}
                  borderRadius={4}
                  mx="$1"
                  bg={index === currentStep ? '$primary' : '$disabled'}
                />
              ))}
            </HStack>
          </Box>

          <Button bg="$primary" py="$4" borderRadius="$md" onPress={handleNext}>
            <ButtonText>{isLastStep ? '시작하기' : '다음'}</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    </Box>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
});

export default GuideFirstScreen;
