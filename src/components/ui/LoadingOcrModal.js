import React from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingOcrModal = ({ visible, message = '이미지 처리 중...' }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <LottieView
          source={require('../../assets/lottie/ocr_animation.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  lottieAnimation: {
    width: 170,
    height: 170,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

export default LoadingOcrModal;
