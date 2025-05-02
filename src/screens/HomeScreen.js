import React, { useState } from 'react';
import { Image, StyleSheet, Alert, View, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const HomeScreen = () => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    console.log('[HomeScreen] pickImage function started.'); // 함수 시작 로그

    try {
      // 오류 처리를 위해 try...catch 추가
      // 갤러리 접근 권한 확인
      console.log('[HomeScreen] Checking media library permissions...');
      const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log(`[HomeScreen] Current permission status: ${currentStatus}`);

      let finalStatus = currentStatus;
      if (currentStatus !== 'granted') {
        console.log('[HomeScreen] Permission not granted, requesting again...');
        // 권한 재요청
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log(`[HomeScreen] Requested permission status: ${newStatus}`);
        finalStatus = newStatus; // 최종 상태 업데이트
      }

      // 최종 권한 상태 확인
      if (finalStatus !== 'granted') {
        Alert.alert(
          '권한 필요',
          '갤러리에 접근하려면 권한이 필요합니다. 앱 설정에서 허용해주세요.'
        );
        console.log('[HomeScreen] Final permission status is not granted. Aborting.');
        return; // 권한 없으면 여기서 종료
      }

      // 권한이 있으면 이미지 라이브러리 실행
      console.log('[HomeScreen] Permission granted. Launching image library...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('[HomeScreen] ImagePicker result:', result); // 결과 로그 상세 확인

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('[HomeScreen] Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      } else {
        console.log('[HomeScreen] Image selection cancelled or failed.');
      }
    } catch (error) {
      console.error('[HomeScreen] Error in pickImage function:', error); // 오류 로그 출력
      Alert.alert('오류 발생', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.content}>
          <Text style={styles.title}>홈 스크린</Text>

          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>갤러리에서 이미지 선택</Text>
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#56AEE9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    resizeMode: 'contain',
    borderRadius: 8,
  },
});

export default HomeScreen;
