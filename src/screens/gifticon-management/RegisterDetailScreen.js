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
  const [expiryDate, setExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isImageEditorVisible, setImageEditorVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [croppedImageResult, setCroppedImageResult] = useState(null);
  const cropViewRef = useRef(null);

  // 초기 화면 로드시 이미지가 있는지 확인
  useEffect(() => {
    if (route.params?.selectedImage) {
      setCurrentImageUri(route.params.selectedImage.uri);
    }
  }, [route.params]);

  // useEffect로 크롭 결과를 감시하여 적용
  useEffect(() => {
    if (croppedImageResult && croppedImageResult.uri) {
      setCurrentImageUri(croppedImageResult.uri);
    }
  }, [croppedImageResult]);

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
    // 이미 이미지가 있으면 바로 편집 화면으로, 없으면 옵션 모달 보여주기
    if (currentImageUri) {
      setImageEditorVisible(true);
    } else {
      setImageOptionVisible(true);
    }
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
        return false;
      }
    }
    return true;
  };

  // 갤러리에서 이미지 선택
  const handlePickImage = () => {
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

      // 이미지 라이브러리 호출
      launchImageLibrary(options, response => {
        if (response.didCancel) {
          // 사용자가 취소
        } else if (response.error) {
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          // 최신 버전의 react-native-image-picker는 응답 형식이 다름
          const imageAsset = response.assets ? response.assets[0] : response;

          if (imageAsset && imageAsset.uri) {
            // 선택한 이미지 편집 모드 시작
            setCurrentImageUri(imageAsset.uri);
            setImageEditorVisible(true);
          } else {
            Alert.alert('오류', '이미지를 불러올 수 없습니다. 다른 이미지를 선택해주세요.');
          }
        }
      });
    } catch (error) {
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

      // 카메라 호출
      launchCamera(options, response => {
        if (response.didCancel) {
          // 사용자가 취소
        } else if (response.error) {
          Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          // 최신 버전의 react-native-image-picker는 응답 형식이 다름
          const imageAsset = response.assets ? response.assets[0] : response;

          if (imageAsset && imageAsset.uri) {
            // 선택한 이미지 편집 모드 시작
            setCurrentImageUri(imageAsset.uri);
            setImageEditorVisible(true);
          } else {
            Alert.alert('오류', '이미지를 불러올 수 없습니다. 다시 촬영해주세요.');
          }
        }
      });
    } catch (error) {
      Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
    }
  };

  // 이미지 편집 완료 후 처리
  const handleImageEditComplete = () => {
    // 편집기 닫기만 하고, 이미지는 onImageCrop에서 처리
    setImageEditorVisible(false);
  };

  // 이미지 편집 취소
  const handleImageEditCancel = () => {
    // 취소 시 크롭 결과 초기화
    setCroppedImageResult(null);
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
    if (!date) return '';

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

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* 이미지 선택 영역 */}
          <View style={styles.imageContainerWrapper}>
            <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
              {currentImageUri ? (
                <Image source={{ uri: currentImageUri }} style={styles.image} resizeMode="cover" />
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
          </View>

          {/* 입력 폼 */}
          <View style={styles.formContainer}>
            <Text variant="h4" weight="bold" style={styles.formSectionTitle}>
              바코드 번호 입력
            </Text>
            <InputLine
              value={barcode}
              onChangeText={setBarcode}
              placeholder="바코드 번호를 입력해주세요."
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />

            <Text variant="h4" weight="bold" style={styles.formSectionTitle}>
              기프티콘 정보 입력
            </Text>
            <InputLine
              value={brand}
              onChangeText={setBrand}
              placeholder="브랜드명을 입력해주세요."
              containerStyle={styles.inputContainer}
            />

            <InputLine
              value={productName}
              onChangeText={setProductName}
              placeholder="상품명을 입력해주세요."
              containerStyle={styles.inputContainer}
            />

            <InputLine
              value={formatDate(expiryDate)}
              placeholder="유효기간을 입력해주세요."
              containerStyle={styles.inputContainer}
              rightIcon={
                <TouchableOpacity onPress={showDatePickerHandler}>
                  <Icon name="calendar-today" size={22} color="#333333" />
                </TouchableOpacity>
              }
              editable={false}
              onTouchStart={showDatePickerHandler}
            />

            {showDatePicker && (
              <DateTimePicker
                value={expiryDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        </ScrollView>

        {/* 등록 버튼 */}
        <Button
          title="등록하기"
          onPress={handleRegister}
          variant="primary"
          size="lg"
          style={styles.button}
        />
      </View>

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
                    Alert.alert('오류', '이미지 로드 중 오류가 발생했습니다.');
                  }}
                  onImageCrop={res => {
                    // 크롭 결과 확인
                    if (res && res.uri) {
                      // 크롭 결과를 상태에 저장
                      setCroppedImageResult({ ...res });
                      // 현재 이미지 URI도 즉시 업데이트
                      setCurrentImageUri(res.uri);
                    }
                  }}
                  cropAreaWidth={300}
                  cropAreaHeight={300}
                  containerColor="black"
                  areaColor="white"
                  keepAspectRatio={keepAspectRatio}
                  aspectRatio={aspectRatio}
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
                if (cropViewRef.current) {
                  try {
                    // 회전 후 즉시 저장 시도
                    cropViewRef.current.rotateImage(true);
                    setTimeout(() => {
                      if (cropViewRef.current) {
                        cropViewRef.current.saveImage(true, 100);
                      }
                    }, 300); // 약간의 딜레이 추가
                  } catch (error) {
                    // 오류 처리
                  }
                }
              }}
            >
              <Icon name="rotate-right" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                회전
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolbarButton, !keepAspectRatio && styles.activeToolbarButton]}
              onPress={() => {
                setKeepAspectRatio(false);
                setAspectRatio(null);
              }}
            >
              <Icon name="crop-free" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                자유
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                keepAspectRatio &&
                  aspectRatio &&
                  aspectRatio.width === 1 &&
                  aspectRatio.height === 1 &&
                  styles.activeToolbarButton,
              ]}
              onPress={() => {
                setKeepAspectRatio(true);
                setAspectRatio({ width: 1, height: 1 });
              }}
            >
              <Icon name="crop-square" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                1:1
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                keepAspectRatio &&
                  aspectRatio &&
                  aspectRatio.width === 4 &&
                  aspectRatio.height === 3 &&
                  styles.activeToolbarButton,
              ]}
              onPress={() => {
                setKeepAspectRatio(true);
                setAspectRatio({ width: 4, height: 3 });
              }}
            >
              <Icon name="crop-7-5" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                4:3
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                keepAspectRatio &&
                  aspectRatio &&
                  aspectRatio.width === 16 &&
                  aspectRatio.height === 9 &&
                  styles.activeToolbarButton,
              ]}
              onPress={() => {
                setKeepAspectRatio(true);
                setAspectRatio({ width: 16, height: 9 });
              }}
            >
              <Icon name="crop-16-9" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                16:9
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 25,
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingBottom: 20,
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
  imageContainerWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    width: 180,
    height: 180,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginTop: 15,
    width: 180,
  },
  formContainer: {
    marginTop: 5,
  },
  formSectionTitle: {
    marginTop: 5,
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 5,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    marginBottom: 20,
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
  activeToolbarButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  toolbarButtonText: {
    marginTop: 8,
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
