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
import { CommonActions } from '@react-navigation/native';
import { markAppAsLaunched } from '../utils/appStorage';

const { width } = Dimensions.get('window');

const GuideFirstScreen = ({ navigation }) => {
  const handleStart = async () => {
    try {
      await markAppAsLaunched();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Permission' }],
        })
      );
    } catch (error) {
      console.error('네비게이션 오류 (GuideFirstScreen):', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Permission' }], // Fallback navigation
        })
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.mainContentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
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
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.titleText}>아차차!</Text>
            <Text style={styles.subText}>또 기프티콘 유효기간을</Text>
            <Text style={styles.subText}>놓치셨다구요?</Text>
          </View>

          <View style={styles.paginationContainer}>
            {[...Array(5)].map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === 0 ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>다음</Text>
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
    marginBottom: -50,
    minHeight: width * 0.6,
  },
  giftboxImage: {
    width: width * 0.5,
    height: width * 0.5,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  subText: {
    fontSize: 22,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#555',
  },
  dotInactive: {
    backgroundColor: '#cccccc',
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