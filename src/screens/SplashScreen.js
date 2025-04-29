import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import theme from '../theme';
// import { checkIsFirstLaunch } from '../utils/appStorage'; // Temporarily disable first launch check

const SPLASH_DURATION = 2000;

const SplashScreenComponent = ({ navigation }) => {
  // const [isLoadingStorage, setIsLoadingStorage] = useState(true); // No longer needed for testing
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [timePassed, setTimePassed] = useState(false);

  console.log('SplashScreen 렌더링됨 (Guide Always)');

  // Always assume first launch for testing & start timer
  useEffect(() => {
    let timer = null;

    // --- Temporarily disable first launch check ---
    console.log('개발 테스트: 항상 첫 실행으로 간주');
    setIsFirstLaunch(true); // Always set to true for testing
    // setIsLoadingStorage(false); // No longer needed

    // Start timer immediately
    timer = setTimeout(() => {
      console.log(`Splash Timer ${SPLASH_DURATION}ms 완료`);
      setTimePassed(true);
    }, SPLASH_DURATION);
    // --- End of temporary modification ---

    /* --- Original First Launch Check Logic (Commented Out) ---
    const performInitialCheck = async () => {
      try {
        const firstLaunch = await checkIsFirstLaunch(); 
        setIsFirstLaunch(firstLaunch);
        console.log(firstLaunch ? '첫 실행 감지됨' : '첫 실행 아님', '(from appStorage)');
      } catch (error) {
        setIsFirstLaunch(false);
      } finally {
        setIsLoadingStorage(false);
        timer = setTimeout(() => {
          console.log(`Splash Timer ${SPLASH_DURATION}ms 완료`);
          setTimePassed(true);
        }, SPLASH_DURATION);
      }
    };
    performInitialCheck();
    */

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Navigate after timer complete (isFirstLaunch is always true in this test mode)
  useEffect(() => {
    if (timePassed && isFirstLaunch !== null) {
      const nextRoute = isFirstLaunch ? 'GuideFirst' : 'Permission'; // Will always be GuideFirst now
      console.log(`${nextRoute} 화면으로 이동 (Guide Always)`);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: nextRoute }],
        })
      );
    }
  }, [timePassed, isFirstLaunch, navigation]);

  // Always show logo (no loading indicator needed as check is bypassed)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    // Centering is handled by the container's justify/align properties
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreenComponent;
