// 기프티콘 등록 상세 스크린

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  StatusBar,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { Button, InputLine, Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon as RNEIcon } from 'react-native-elements';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CropView } from 'react-native-image-crop-tools';

const RegisterDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // 화면 데이터 상태 관리
  const [brand, setBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isImageEditorVisible, setImageEditorVisible] = useState(false);
  const cropViewRef = useRef(null);

  // 초기 화면 로드시 이미지가 있는지 확인
  useEffect(() => {
    if (route.params?.selectedImage) {
      console.log('초기 이미지 수신:', route.params.selectedImage);
      setCurrentImageUri(route.params.selectedImage.uri);
    }
  }, [route.params]);

  // 뒤로가기 처리
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 날짜 선택기 표시
  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  // 날짜 변경 처리
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  // 이미지 선택 모달 표시
  const showImageOptions = () => {
    setImageOptionVisible(true);
  };

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
  const handlePickImage = () => {
    console.log('갤러리 버튼 클릭됨');

    try {
      // 옵션 설정
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

      console.log('이미지 라이브러리 호출 전');

      // 이미지 라이브러리 호출
      launchImageLibrary(options, response => {
        console.log('이미지 선택 응답:', JSON.stringify(response));

        if (response.didCancel) {
          console.log('사용자가 이미지 선택을 취소했습니다');
        } else if (response.error) {
          console.error('이미지 선택 오류: ', response.error);
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          // 직접 파일 경로 확인 로그
          console.log('이미지 응답 전체:', response);

          // 최신 버전의 react-native-image-picker는 응답 형식이 다름
          const imageAsset = response.assets ? response.assets[0] : response;

          console.log('이미지 응답 처리:', imageAsset);
          console.log('이미지 uri:', imageAsset.uri);

          if (imageAsset && imageAsset.uri) {
            // 선택한 이미지 편집 모드 시작 (정확한 경로 사용)
            console.log('이미지 URI 설정:', imageAsset.uri);
            setCurrentImageUri(imageAsset.uri);
            setImageEditorVisible(true);
          } else {
            console.error('유효한 이미지 URI가 없습니다');
            Alert.alert('오류', '이미지를 불러올 수 없습니다. 다른 이미지를 선택해주세요.');
          }
        }
      });

      console.log('이미지 라이브러리 호출 후');
    } catch (error) {
      console.error('이미지 선택 예외 발생:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 카메라로 촬영
  const handleOpenCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        Alert.alert('권한 없음', '카메라를 사용하기 위해 권한이 필요합니다.');
        return;
      }

      // 옵션 설정
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

      console.log('카메라 호출 전');

      // 카메라 호출
      launchCamera(options, response => {
        console.log('카메라 응답:', JSON.stringify(response));

        if (response.didCancel) {
          console.log('사용자가 카메라 촬영을 취소했습니다');
        } else if (response.error) {
          console.error('카메라 오류: ', response.error);
          Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          // 직접 파일 경로 확인 로그
          console.log('이미지 응답 전체:', response);

          // 최신 버전의 react-native-image-picker는 응답 형식이 다름
          const imageAsset = response.assets ? response.assets[0] : response;

          console.log('이미지 응답 처리:', imageAsset);
          console.log('이미지 uri:', imageAsset.uri);

          if (imageAsset && imageAsset.uri) {
            // 선택한 이미지 편집 모드 시작 (정확한 경로 사용)
            console.log('이미지 URI 설정:', imageAsset.uri);
            setCurrentImageUri(imageAsset.uri);
            setImageEditorVisible(true);
          } else {
            console.error('유효한 이미지 URI가 없습니다');
            Alert.alert('오류', '이미지를 불러올 수 없습니다. 다시 촬영해주세요.');
          }
        }
      });

      console.log('카메라 호출 후');
    } catch (error) {
      console.error('카메라 촬영 예외 발생:', error);
      Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
    }
  };

  // 이미지 편집 완료 후 처리
  const handleImageEditComplete = () => {
    console.log('이미지 편집 완료 버튼 클릭됨');
    if (cropViewRef.current) {
      try {
        cropViewRef.current
          .cropImage()
          .then(result => {
            console.log('이미지 크롭 성공:', result);
            setCurrentImageUri(result);
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
    } else {
      console.error('cropViewRef가 없습니다');
      Alert.alert('오류', '이미지 편집기를 사용할 수 없습니다. 다시 시도해주세요.');
      setImageEditorVisible(false);
    }
  };

  // 이미지 편집 취소
  const handleImageEditCancel = () => {
    console.log('이미지 편집 취소됨');
    setImageEditorVisible(false);
  };

  // 기프티콘 등록 처리
  const handleRegister = () => {
    if (!currentImageUri) {
      Alert.alert('알림', '기프티콘 이미지를 등록해주세요.');
      return;
    }

    if (!brand.trim()) {
      Alert.alert('알림', '브랜드명을 입력해주세요.');
      return;
    }

    if (!productName.trim()) {
      Alert.alert('알림', '상품명을 입력해주세요.');
      return;
    }

    // 여기서 등록 API 호출 또는 저장 로직을 구현
    Alert.alert('성공', '기프티콘이 성공적으로 등록되었습니다.', [
      {
        text: '확인',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  // 날짜를 YYYY.MM.DD 형식으로 포맷
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

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
          leftIcon={<Icon name="arrow-back-ios" size={22} color={theme.colors.black} />}
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
        {/* 이미지 선택 영역 */}
        <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
          {currentImageUri ? (
            <Image source={{ uri: currentImageUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <RNEIcon name="image" type="material" size={60} color="#CCCCCC" />
              <Text variant="body2" color="#666666" style={styles.placeholderText}>
                이미지를 등록해주세요
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          title={currentImageUri ? '이미지 편집하기' : '이미지 등록하기'}
          variant="outline"
          style={styles.imageButton}
          onPress={showImageOptions}
        />

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          <InputLine
            label="브랜드"
            value={brand}
            onChangeText={setBrand}
            placeholder="브랜드명을 입력해주세요."
            containerStyle={styles.inputContainer}
          />

          <InputLine
            label="상품명"
            value={productName}
            onChangeText={setProductName}
            placeholder="상품명을 입력해주세요."
            containerStyle={styles.inputContainer}
          />

          <InputLine
            label="바코드 번호"
            value={barcode}
            onChangeText={setBarcode}
            placeholder="바코드 번호를 입력해주세요."
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />

          <Text variant="h4" weight="bold" style={styles.formLabel}>
            유효기간
          </Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={showDatePickerHandler}>
            <Text variant="body1">{formatDate(expiryDate)}</Text>
            <Icon name="calendar-today" size={22} color="#333333" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* 등록 버튼 */}
        <Button title="등록하기" style={styles.registerButton} onPress={handleRegister} />
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
              <Icon name="photo-library" size={24} color="#333333" style={styles.modalOptionIcon} />
              <Text variant="body1">갤러리에서 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handleOpenCamera();
              }}
            >
              <Icon name="camera-alt" size={24} color="#333333" style={styles.modalOptionIcon} />
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
            {currentImageUri ? (
              <>
                <CropView
                  ref={cropViewRef}
                  sourceUrl={currentImageUri}
                  style={styles.cropView}
                  onError={error => {
                    console.error('이미지 크롭 에러:', error);
                    console.error('에러가 발생한 이미지 URI:', currentImageUri);
                    Alert.alert('오류', '이미지 로드 중 오류가 발생했습니다.');
                  }}
                  cropAreaWidth={300}
                  cropAreaHeight={300}
                  containerColor="black"
                  areaColor="white"
                  keepAspectRatio={false}
                  iosDimensionSwapEnabled={true}
                />
              </>
            ) : (
              <View style={styles.emptyImageContainer}>
                <Icon name="image" size={50} color="#CCCCCC" />
                <Text variant="body2" color="#DDDDDD" style={styles.emptyImageText}>
                  이미지 로드 실패
                </Text>
              </View>
            )}
          </View>

          <View style={styles.editorToolbar}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => {
                console.log('회전 버튼 클릭');
                if (cropViewRef.current) {
                  try {
                    cropViewRef.current.rotateImage(true);
                  } catch (error) {
                    console.error('회전 오류:', error);
                  }
                } else {
                  console.error('cropViewRef가 없습니다');
                }
              }}
            >
              <Icon name="rotate-right" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                회전
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
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 10,
  },
  imageButton: {
    marginTop: 16,
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  formLabel: {
    marginBottom: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 30,
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
    backgroundColor: '#000000',
  },
  cropView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
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
  debugText: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: 'white',
    fontSize: 12,
    zIndex: 100,
  },
  emptyImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImageText: {
    color: '#DDDDDD',
  },
});

export default RegisterDetailScreen;
