import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

// A splash screen that shows the logo for a short duration
// then navigates to the Permissions screen.
const SplashScreenComponent = ({ navigation }) => {
  console.log('Timed SplashScreen 렌더링됨 (src/screens)');

  useEffect(() => {
    // Set a timer to navigate after 1.5 seconds
    const timer = setTimeout(() => {
      console.log('Timed SplashScreen: 타이머 완료, Permissions 화면으로 이동');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Permission' }], // Navigate to Permissions
        })
      );
    }, 2000); // 1.5 seconds delay

    // Clear the timer if the component unmounts before the timer finishes
    return () => clearTimeout(timer);
  }, [navigation]); // Add navigation to dependency array

  return (
    <SafeAreaView style={styles.container}>
      {/* Ensure status bar is visible and blends with the white background */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/splash-icon.png')} // Path relative to src/screens/
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
    backgroundColor: '#ffffff', // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    // Centering is handled by the container's justify/align properties
  },
  logo: {
    width: 200, // Adjust size as needed
    height: 200, // Adjust size as needed
  },
});

export default SplashScreenComponent; 