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
} from 'react-native';
import { Text } from '../../../components/ui';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CropView } from 'react-native-image-crop-tools';

const RegisterMainScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isImageEditorVisible, setImageEditorVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [croppedImageResult, setCroppedImageResult] = useState(null);
  const cropViewRef = useRef(null);

  // 기프티콘 타입 및 등록 위치 모달 상태
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const [gifticonType, setGifticonType] = useState('PRODUCT'); // 'PRODUCT' 또는 'AMOUNT'
  const [boxType, setBoxType] = useState('MY_BOX'); // 'MY_BOX' 또는 'SHARE_BOX'
  const [selectedShareBoxId, setSelectedShareBoxId] = useState(null);

  // 더미 데이터: 쉐어박스 목록
  const shareBoxes = [
    { id: 1, name: '으라차차 해인네' },
    { id: 2, name: '으라차차 주은이네' },
    { id: 3, name: '으라차차 대성이네' },
  ];

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 수동 등록 처리
  const handleManualRegister = useCallback(() => {
    // 타입 선택 모달 먼저 표시
    setTypeModalVisible(true);
  }, []);

  // 이미지 선택 모달 표시 전 타입 선택 모달 표시
  const showTypeModal = useCallback(() => {
    setTypeModalVisible(true);
  }, []);

  // 타입 선택 완료 후 이미지 옵션 모달 표시
  const handleTypeSelected = useCallback(() => {
    setTypeModalVisible(false);
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
  }, []);

  // 카메라로 촬영
  const handleOpenCamera = useCallback(async () => {
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
  }, []);

  // 이미지 편집 완료 후 처리
  const handleImageEditComplete = useCallback(() => {
    console.log('이미지 편집 완료 버튼 클릭됨');
    try {
      if (cropViewRef.current) {
        const result = cropViewRef.current.saveImage(true, 90);
        console.log('이미지 크롭 결과 트라이:', result);
      }

      // 편집 완료 후 croppedImageResult 또는 원본 URI 사용
      const resultUri = croppedImageResult ? croppedImageResult.uri : currentImageUri;
      console.log('최종 사용 이미지:', resultUri);

      // 편집한 이미지와 함께 상세 화면으로 이동 (기프티콘 타입과 박스 타입도 전달)
      navigation.navigate('RegisterDetail', {
        selectedImage: { uri: resultUri },
        gifticonType,
        boxType,
        shareBoxId: boxType === 'SHARE_BOX' ? selectedShareBoxId : null,
      });
      setImageEditorVisible(false);
    } catch (error) {
      console.error('이미지 편집 예외 발생:', error);
      Alert.alert('오류', '이미지를 편집하는 중 문제가 발생했습니다.');
      setImageEditorVisible(false);
    }
  }, [navigation, currentImageUri, croppedImageResult, gifticonType, boxType, selectedShareBoxId]);

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
          <TouchableOpacity onPress={showTypeModal}>
            <Card style={styles.uploadCard}>
              <View style={styles.uploadContent}>
                <Image
                  source={require('../../../assets/images/gifticon-upload.png')}
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

      {/* 기프티콘 타입 및 박스 선택 모달 */}
      <Modal
        visible={isTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.typeModalContent]}>
            {/* 상품형/금액형 선택 버튼 */}
            <View style={styles.typeButtonsContainer}>
              <TouchableOpacity
                style={[styles.typeButton, gifticonType === 'PRODUCT' && styles.typeButtonSelected]}
                onPress={() => setGifticonType('PRODUCT')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    gifticonType === 'PRODUCT' && styles.typeButtonTextSelected,
                  ]}
                >
                  상품형
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, gifticonType === 'AMOUNT' && styles.typeButtonSelected]}
                onPress={() => setGifticonType('AMOUNT')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    gifticonType === 'AMOUNT' && styles.typeButtonTextSelected,
                  ]}
                >
                  금액형
                </Text>
              </TouchableOpacity>
            </View>

            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              기본
            </Text>

            {/* 마이박스 선택 */}
            <View style={styles.typeSection}>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    boxType === 'MY_BOX' && styles.checkboxContainerSelected,
                  ]}
                  onPress={() => {
                    setBoxType('MY_BOX');
                    setSelectedShareBoxId(null);
                  }}
                >
                  <View style={styles.checkbox}>
                    {boxType === 'MY_BOX' && (
                      <Icon name="check" type="material" size={16} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>마이박스</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text variant="h4" weight="bold" style={[styles.modalTitle, styles.sectionTitle]}>
              쉐어 박스
            </Text>

            {/* 쉐어박스 선택 */}
            <View style={styles.boxSection}>
              {shareBoxes.map(box => (
                <View key={box.id} style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxContainer,
                      boxType === 'SHARE_BOX' &&
                        selectedShareBoxId === box.id &&
                        styles.checkboxContainerSelected,
                    ]}
                    onPress={() => {
                      setBoxType('SHARE_BOX');
                      setSelectedShareBoxId(box.id);
                    }}
                  >
                    <View style={styles.checkbox}>
                      {boxType === 'SHARE_BOX' && selectedShareBoxId === box.id && (
                        <Icon name="check" type="material" size={16} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{box.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.typeButtonContainer}>
              <Button
                title="취소"
                variant="outline"
                onPress={() => setTypeModalVisible(false)}
                style={styles.typeModalButton}
              />
              <Button
                title="확인"
                variant="primary"
                onPress={handleTypeSelected}
                style={styles.typeModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 이미지 옵션 모달 */}
      <Modal
        visible={isImageOptionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageOptionVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
        </View>
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
                  onImageCrop={res => {
                    console.log('이미지 크롭 결과:', res);
                    setCroppedImageResult(res);
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
                <Icon name="image" type="material" size={50} color="#CCCCCC" />
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
              <Icon name="rotate-right" type="material" size={24} color="#FFFFFF" />
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
              <Icon name="crop-free" type="material" size={24} color="#FFFFFF" />
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
              <Icon name="crop-square" type="material" size={24} color="#FFFFFF" />
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
              <Icon name="crop-7-5" type="material" size={24} color="#FFFFFF" />
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
              <Icon name="crop-16-9" type="material" size={24} color="#FFFFFF" />
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
    marginBottom: 0,
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
    marginTop: 10,
    marginBottom: 20,
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
  typeModalContent: {
    maxHeight: '90%',
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 15,
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
  // 기프티콘 타입 및 위치 선택 모달 스타일
  typeSection: {
    marginBottom: 20,
  },
  boxSection: {
    marginBottom: 20,
  },
  typeRow: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  checkboxContainerSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#F5F9FF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    borderColor: '#4A90E2',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  typeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  typeModalButton: {
    flex: 1,
    marginHorizontal: 5,
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
  // 상품형/금액형 버튼 스타일
  typeButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  typeButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
});

export default RegisterMainScreen;
