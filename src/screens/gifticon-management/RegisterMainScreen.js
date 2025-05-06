// 기프티콘 등록 스크린

import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import { Text } from '../../components/ui';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { ImageCropView } from 'react-native-image-crop-tools';

const RegisterScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isImageEditorVisible, setImageEditorVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const cropViewRef = useRef(null);

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 수동 등록 처리
  const handleManualRegister = useCallback(() => {
    // 수동 등록 화면으로 이동
    navigation.navigate('RegisterDetail');
  }, [navigation]);

  // 이미지 선택 모달 표시
  const showImageOptions = useCallback(() => {
    setImageOptionVisible(true);
  }, []);

  // 안드로이드 카메라 권한 요청
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: '카메라 접근 권한',
          message: '기프티콘 등록을 위해 카메라 접근 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '취소',
          buttonPositive: '확인',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // 갤러리에서 이미지 선택
  const handlePickImage = useCallback(() => {
    console.log('갤러리 버튼 클릭됨');

    try {
      // 옛날 버전 사용 방식으로 변경
      const options = {
        title: '이미지 선택',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      };

      console.log('launchImageLibrary 호출 전');

      // 구 버전 API 호출 (8.x)
      launchImageLibrary(options, response => {
        console.log('이미지 선택 응답:', JSON.stringify(response));

        if (response.didCancel) {
          console.log('사용자가 이미지 선택을 취소했습니다');
        } else if (response.error) {
          console.error('이미지 선택 오류: ', response.error);
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          console.log('이미지 선택 성공:', response.uri);
          // 선택한 이미지 편집 모드 시작
          setCurrentImageUri(response.uri);
          setImageEditorVisible(true);
        }
      });

      console.log('launchImageLibrary 호출 후');
    } catch (error) {
      console.error('이미지 선택 예외 발생:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  }, []);

  // 카메라로 촬영
  const handleOpenCamera = useCallback(async () => {
    console.log('카메라 버튼 클릭됨');

    try {
      const hasPermission = await requestCameraPermission();
      console.log('카메라 권한 상태:', hasPermission);

      if (!hasPermission) {
        Alert.alert('권한 없음', '카메라를 사용하기 위해 권한이 필요합니다.');
        return;
      }

      // 옛날 버전 사용 방식으로 변경
      const options = {
        title: '사진 촬영',
        storageOptions: {
          skipBackup: true,
          path: 'images',
          cameraRoll: true,
          waitUntilSaved: true,
        },
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      };

      console.log('launchCamera 호출 전');

      // 구 버전 API 호출 (8.x)
      launchCamera(options, response => {
        console.log('카메라 응답:', JSON.stringify(response));

        if (response.didCancel) {
          console.log('사용자가 카메라 촬영을 취소했습니다');
        } else if (response.error) {
          console.error('카메라 오류: ', response.error);
          Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          console.log('카메라 촬영 성공:', response.uri);
          // 선택한 이미지 편집 모드 시작
          setCurrentImageUri(response.uri);
          setImageEditorVisible(true);
        }
      });

      console.log('launchCamera 호출 후');
    } catch (error) {
      console.error('카메라 촬영 예외 발생:', error);
      Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
    }
  }, []);

  // 이미지 편집 완료 후 처리
  const handleImageEditComplete = useCallback(() => {
    console.log('이미지 편집 완료 버튼 클릭됨');
    if (cropViewRef.current) {
      try {
        cropViewRef.current
          .saveImage(true, 90)
          .then(result => {
            console.log('이미지 크롭 성공:', result.uri);
            // 편집한 이미지와 함께 상세 화면으로 이동
            navigation.navigate('RegisterDetail', { selectedImage: { uri: result.uri } });
            setImageEditorVisible(false);
          })
          .catch(error => {
            console.error('이미지 저장 오류:', error);
            Alert.alert('오류', '이미지를 저장하는 중 오류가 발생했습니다.');
            setImageEditorVisible(false);
          });
      } catch (error) {
        console.error('이미지 편집 예외 발생:', error);
        Alert.alert('오류', '이미지를 편집하는 중 문제가 발생했습니다.');
        setImageEditorVisible(false);
      }
    }
  }, [navigation]);

  // 이미지 편집 취소
  const handleImageEditCancel = useCallback(() => {
    console.log('이미지 편집 취소됨');
    setImageEditorVisible(false);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={
            <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          }
        />
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 등록
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 업로드 카드 */}
        <Shadow
          distance={10}
          startColor={'rgba(0, 0, 0, 0.028)'}
          offset={[0, 1]}
          style={styles.shadowContainer}
        >
          <TouchableOpacity onPress={showImageOptions}>
            <Card style={styles.uploadCard}>
              <View style={styles.uploadContent}>
                <Image
                  source={require('../../assets/images/gifticon-upload.png')}
                  style={styles.uploadIcon}
                  resizeMode="contain"
                />
                <Text variant="h2" weight="bold" style={styles.uploadTitleMargin}>
                  기프티콘 업로드
                </Text>
                <Text variant="h5" weight="regular" color="#718096" style={styles.textCenter}>
                  지금 바로 갤러리에 저장된
                </Text>
                <Text variant="h5" weight="regular" color="#718096" style={styles.textCenter}>
                  기프티콘을 업로드 해보세요.
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </Shadow>

        {/* 수동 등록 버튼 - TouchableOpacity로 간단하게 구현 */}
        <TouchableOpacity style={styles.manualButton} onPress={handleManualRegister}>
          <Text variant="h4" weight="semiBold" color="white" style={styles.manualTextMain}>
            수동 등록
          </Text>
          <Text variant="body2" weight="regular" color="white" style={styles.manualTextSub}>
            등록에 문제가 발생하셨나요?
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 등록하신 기프티콘은... 섹션 */}
        <View style={styles.infoSection}>
          <Text variant="h2" weight="bold">
            등록하신 기프티콘은
          </Text>
          <Text variant="h2" weight="bold">
            다음과 같은 절차를 통해 관리돼요.
          </Text>
        </View>

        {/* 절차 스텝 */}
        <View style={styles.stepsContainer}>
          {/* 스텝 1 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: theme.colors.tertiary }]}>
              <Text variant="h3" weight="bold" color="white">
                1
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="regular">
                갤러리에 저장된 기프티콘을
              </Text>
              <Text variant="body1" weight="regular">
                앱에 업로드해요.
              </Text>
            </View>
          </View>

          {/* 스텝 2 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: theme.colors.primary }]}>
              <Text variant="h3" weight="bold" color="white">
                2
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="regular">
                OCR 기술을 통해
              </Text>
              <Text variant="body1" weight="regular">
                브랜드, 상품, 유효기간을 모두 저장해요.
              </Text>
            </View>
          </View>

          {/* 스텝 3 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: theme.colors.secondary }]}>
              <Text variant="h3" weight="bold" color="white">
                3
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="regular">
                이렇게 저장된 기프티콘은
              </Text>
              <Text variant="body1" weight="regular">
                사용, 선물, 공유가 가능해져요.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 이미지 옵션 모달 */}
      <Modal
        visible={isImageOptionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageOptionVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageOptionVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              이미지 선택
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handlePickImage();
              }}
            >
              <Icon
                name="photo-library"
                type="material"
                size={24}
                color="#333333"
                style={styles.modalOptionIcon}
              />
              <Text variant="body1">갤러리에서 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handleOpenCamera();
              }}
            >
              <Icon
                name="camera-alt"
                type="material"
                size={24}
                color="#333333"
                style={styles.modalOptionIcon}
              />
              <Text variant="body1">카메라로 촬영</Text>
            </TouchableOpacity>
            <Button
              title="취소"
              variant="outline"
              onPress={() => setImageOptionVisible(false)}
              style={styles.modalCancelButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 이미지 편집 모달 */}
      <Modal visible={isImageEditorVisible} animationType="slide">
        <View style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={handleImageEditCancel} style={styles.editorHeaderButton}>
              <Text variant="body1" weight="bold" color="#56AEE9">
                취소
              </Text>
            </TouchableOpacity>
            <Text variant="h4" weight="bold" color="white">
              이미지 편집
            </Text>
            <TouchableOpacity onPress={handleImageEditComplete} style={styles.editorHeaderButton}>
              <Text variant="body1" weight="bold" color="#56AEE9">
                적용
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cropContainer}>
            {currentImageUri && (
              <ImageCropView
                ref={cropViewRef}
                imageUri={currentImageUri}
                style={styles.cropView}
                cropAreaWidth={Dimensions.get('window').width * 0.9}
                cropAreaHeight={Dimensions.get('window').width * 0.9}
                containerColor="rgba(0, 0, 0, 0.8)"
                areaColor="rgba(255, 255, 255, 0.3)"
              />
            )}
          </View>

          <View style={styles.editorToolbar}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => {
                console.log('회전 버튼 클릭');
                cropViewRef.current?.rotateImage(true);
              }}
            >
              <Icon name="rotate-right" type="material" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                회전
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => {
                console.log('좌우반전 버튼 클릭');
                cropViewRef.current?.flipImage('horizontal');
              }}
            >
              <Icon name="flip" type="material" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                좌우반전
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 48,
  },
  uploadCard: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 2,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 90,
    height: 90,
    marginBottom: 18,
  },
  uploadTitleMargin: {
    marginBottom: 10,
  },
  textCenter: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 2,
  },
  manualButton: {
    backgroundColor: '#BBC1D0',
    borderRadius: 10,
    height: 65,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  manualTextMain: {
    marginBottom: 0,
  },
  manualTextSub: {
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 20,
    marginBottom: 30,
  },
  infoSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  shadowContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
  },
  // 모달 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalCancelButton: {
    marginTop: 16,
  },
  // 이미지 편집기 관련 스타일
  editorContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  editorHeaderButton: {
    padding: 8,
  },
  cropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropView: {
    width: '100%',
    height: '100%',
  },
  editorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  toolbarButtonText: {
    marginTop: 8,
  },
});

export default RegisterScreen;
