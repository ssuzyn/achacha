import React, { useEffect, useState } from 'react';
import { Image, StatusBar, StyleSheet, View, SafeAreaView } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from 'react-native-elements';
// import { checkIsFirstLaunch } from '../utils/appStorage'; // Temporarily disable first launch check

const SPLASH_DURATION = 2000;

const SplashScreenComponent = ({ navigation }) => {
  // const [isLoadingStorage, setIsLoadingStorage] = useState(true); // No longer needed for testing
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [timePassed, setTimePassed] = useState(false);
  const { theme } = useTheme();

  // Always assume first launch for testing & start timer
  useEffect(() => {
    let timer = null;

    // --- Temporarily disable first launch check ---
    setIsFirstLaunch(true); // Always set to true for testing
    // setIsLoadingStorage(false); // No longer needed

    // Start timer immediately
    timer = setTimeout(() => {
      setTimePassed(true);
    }, SPLASH_DURATION);
    // --- End of temporary modification ---

    /* --- Original First Launch Check Logic (Commented Out) ---
    const performInitialCheck = async () => {
      try {
        const firstLaunch = await checkIsFirstLaunch(); 
        setIsFirstLaunch(firstLaunch);
      } catch (error) {
        setIsFirstLaunch(false);
      } finally {
        setIsLoadingStorage(false);
        timer = setTimeout(() => {
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.centerContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/splash_icon.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 100,
  },
});

export default SplashScreenComponent;
