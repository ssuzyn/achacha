// 기프티콘 등록 상세 스크린

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Button, InputLine, Text } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon as RNEIcon } from 'react-native-elements';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';

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
  const [originalImageUri, setOriginalImageUri] = useState(null); // 원본 이미지 URI 저장
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isOriginalImageVisible, setOriginalImageVisible] = useState(false); // 원본 이미지 팝업 표시 여부

  // 이미지 처리 상태 관리
  const processingRef = useRef(false); // 처리 중 상태 관리

  // 이전 화면에서 전달받은 기프티콘 타입 및 등록 위치 정보
  const [gifticonType, setGifticonType] = useState('PRODUCT'); // 'PRODUCT' 또는 'AMOUNT'
  const [boxType, setBoxType] = useState('MY_BOX'); // 'MY_BOX' 또는 'SHARE_BOX'
  const [shareBoxId, setShareBoxId] = useState(null);
  const [isBoxModalVisible, setBoxModalVisible] = useState(false);

  // 더미 데이터: 쉐어박스 목록
  const shareBoxes = [
    { id: 1, name: '으라차차 해인네' },
    { id: 2, name: '으라차차 주은이네' },
    { id: 3, name: '으라차차 대성이네' },
  ];

  // 추가 필드 (금액형일 경우)
  const [amount, setAmount] = useState('');

  // 화면 상태 관리 - 유형 및 위치 선택 완료 여부
  const [isTypeBoxSelected, setIsTypeBoxSelected] = useState(false);
  const [isTypeLocked, setIsTypeLocked] = useState(false); // 유형 선택 잠금 상태

  // 이미지 URI 상태를 메모이제이션하여 렌더링 최적화
  const imageSource = useCallback(uri => {
    if (!uri) return null;
    // 캐시 문제 해결을 위해 타임스탬프 추가
    return { uri: `${uri}?timestamp=${Date.now()}` };
  }, []);

  // 초기 화면 로드시 이미지가 있는지 확인
  useEffect(() => {
    if (route.params?.selectedImage) {
      try {
        const imageUri = route.params.selectedImage.uri;
        console.log('초기 이미지 로드:', imageUri);
        if (imageUri) {
          setCurrentImageUri(imageUri);
          setOriginalImageUri(imageUri); // 원본 이미지 URI 저장
        } else {
          console.warn('유효하지 않은 이미지 URI');
        }
      } catch (error) {
        console.error('이미지 로드 중 오류:', error);
      }
    }

    // 기프티콘 타입 및 등록 위치 정보 가져오기
    if (route.params?.gifticonType) {
      setGifticonType(route.params.gifticonType);
      setIsTypeBoxSelected(true);
      // 최초 등록 시에는 타입 잠금 해제 상태로 유지
    }

    if (route.params?.boxType) {
      setBoxType(route.params.boxType);
    }

    if (route.params?.shareBoxId) {
      setShareBoxId(route.params.shareBoxId);
    }

    // 타입 및 위치가 선택되어 있지 않으면 모달 자동 표시
    if (!route.params?.gifticonType) {
      // 약간의 딜레이 후 모달 표시 (화면 전환 애니메이션이 끝난 후)
      setTimeout(() => {
        setBoxModalVisible(true);
      }, 300);
    }

    // 컴포넌트 언마운트 시 메모리 정리
    return () => {
      console.log('컴포넌트 언마운트: 이미지 상태 정리');
      // 임시 이미지 파일이 있다면 여기서 정리할 수 있음
    };
  }, [route.params]);

  // 편집된 이미지가 있을 경우 썸네일에 표시 (로직 개선)
  useEffect(() => {
    if (currentImageUri) {
      console.log('편집된 이미지로 썸네일 업데이트:', currentImageUri);
    }
  }, [currentImageUri]);

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

  // 박스 모달 표시
  const showBoxModal = () => {
    setBoxModalVisible(true);
  };

  // 박스 선택 완료
  const handleBoxSelected = () => {
    // 타입과 박스 모두 선택되었는지 확인
    if (gifticonType && boxType) {
      setBoxModalVisible(false);
      setIsTypeBoxSelected(true);
      // 모달 확인 버튼 클릭 시 유형 선택 잠금
      setIsTypeLocked(true);
    } else {
      Alert.alert('알림', '기프티콘 타입과 등록 위치를 모두 선택해주세요.');
    }
  };

  // 이미지 컨테이너 터치 핸들러
  const handleImageContainerPress = () => {
    try {
      // 이미지가 있으면 원본 이미지 팝업 표시, 없으면 이미지 옵션 모달 표시
      if (originalImageUri) {
        console.log('원본 이미지 모달 표시:', originalImageUri);
        setOriginalImageVisible(true);
      } else {
        setImageOptionVisible(true);
      }
    } catch (error) {
      console.error('이미지 컨테이너 터치 처리 오류:', error);
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

  // 갤러리에서 이미지 선택 (강화된 로직)
  const handlePickImage = () => {
    try {
      // 옵션 설정
      const options = {
        title: '이미지 선택',
        storageOptions: {
          skipBackup: true,
          path: 'images',
          privateDirectory: true, // 앱 내부 저장 경로 사용
        },
        quality: 0.9, // 조금 더 높은 품질
        maxWidth: 1500, // 적절한 크기로 조정
        maxHeight: 1500,
        includeBase64: false,
      };

      // 이미지 라이브러리 호출
      launchImageLibrary(options, response => {
        console.log('이미지 라이브러리 응답:', JSON.stringify(response).substring(0, 150) + '...');

        if (response.didCancel) {
          console.log('사용자가 이미지 선택을 취소했습니다');
        } else if (response.errorCode) {
          console.error(`이미지 선택 오류 (${response.errorCode}):`, response.errorMessage);
          Alert.alert(
            '오류',
            `이미지를 선택하는 중 오류가 발생했습니다: ${response.errorMessage || '알 수 없는 오류'}`
          );
        } else {
          // 최신 버전의 react-native-image-picker는 응답 형식이 다름
          const imageAsset = response.assets ? response.assets[0] : response;

          if (imageAsset && imageAsset.uri) {
            console.log('이미지 선택 완료 - URI:', imageAsset.uri);
            console.log(
              '이미지 정보:',
              `타입: ${imageAsset.type || '알 수 없음'}, ` +
                `파일명: ${imageAsset.fileName || '알 수 없음'}, ` +
                `크기: ${(imageAsset.fileSize / 1024).toFixed(2)}KB`
            );

            try {
              // 이미지가 유효한지 확인
              if (
                imageAsset.uri.startsWith('file://') ||
                imageAsset.uri.startsWith('content://') ||
                imageAsset.uri.startsWith('/')
              ) {
                // 이미지 URI 저장 (원본 및 현재)
                setOriginalImageUri(imageAsset.uri);
                setCurrentImageUri(imageAsset.uri);

                // 편집 상태 초기화
                processingRef.current = false;

                // 옵션 모달 닫기
                setImageOptionVisible(false);

                // 바로 이미지 편집기 실행
                showImageEditor(imageAsset.uri);
              } else {
                console.error('유효하지 않은 이미지 URI 형식:', imageAsset.uri);
                Alert.alert('오류', '이미지 형식이 유효하지 않습니다. 다른 이미지를 선택해주세요.');
              }
            } catch (err) {
              console.error('이미지 URI 설정 중 오류:', err);
              Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
          } else {
            console.error('이미지 자산이 없음:', imageAsset);
            Alert.alert('오류', '이미지를 불러올 수 없습니다. 다른 이미지를 선택해주세요.');
          }
        }
      });
    } catch (error) {
      console.error('이미지 선택 중 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 카메라로 촬영 (개선된 로직)
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
          privateDirectory: true,
          cameraRoll: true,
          waitUntilSaved: true,
        },
        quality: 0.9,
        maxWidth: 1500,
        maxHeight: 1500,
        includeBase64: false,
        saveToPhotos: false, // 사진 앱에 자동 저장 안 함
      };

      // 카메라 호출
      launchCamera(options, response => {
        console.log('카메라 응답:', JSON.stringify(response).substring(0, 150) + '...');

        if (response.didCancel) {
          console.log('사용자가 카메라 촬영을 취소했습니다');
        } else if (response.errorCode) {
          console.error(`카메라 오류 (${response.errorCode}):`, response.errorMessage);
          Alert.alert(
            '오류',
            `카메라를 사용하는 중 오류가 발생했습니다: ${response.errorMessage || '알 수 없는 오류'}`
          );
        } else {
          // 최신 버전의 react-native-image-picker는 응답 형식이 다름
          const imageAsset = response.assets ? response.assets[0] : response;

          if (imageAsset && imageAsset.uri) {
            console.log('카메라 촬영 완료 - URI:', imageAsset.uri);
            console.log(
              '이미지 정보:',
              `타입: ${imageAsset.type || '알 수 없음'}, ` +
                `파일명: ${imageAsset.fileName || '알 수 없음'}, ` +
                `크기: ${(imageAsset.fileSize / 1024).toFixed(2)}KB`
            );

            try {
              // 이미지가 유효한지 확인
              if (
                imageAsset.uri.startsWith('file://') ||
                imageAsset.uri.startsWith('content://') ||
                imageAsset.uri.startsWith('/')
              ) {
                // 이미지 URI 저장 (원본 및 현재)
                setOriginalImageUri(imageAsset.uri);
                setCurrentImageUri(imageAsset.uri);

                // 편집 상태 초기화
                processingRef.current = false;

                // 옵션 모달 닫기
                setImageOptionVisible(false);

                // 바로 이미지 편집기 실행
                showImageEditor(imageAsset.uri);
              } else {
                console.error('유효하지 않은 이미지 URI 형식:', imageAsset.uri);
                Alert.alert('오류', '카메라 이미지 형식이 유효하지 않습니다. 다시 시도해주세요.');
              }
            } catch (err) {
              console.error('카메라 이미지 URI 설정 중 오류:', err);
              Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
          } else {
            console.error('카메라 이미지 자산이 없음:', imageAsset);
            Alert.alert('오류', '이미지를 불러올 수 없습니다. 다시 촬영해주세요.');
          }
        }
      });
    } catch (error) {
      console.error('카메라 사용 중 오류:', error);
      Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
    }
  };

  // 이미지 편집기 실행 함수
  const showImageEditor = imageUri => {
    try {
      if (!imageUri) {
        console.warn('이미지 URI가 없습니다');
        return;
      }

      if (processingRef.current) {
        console.warn('이미지 처리 중입니다');
        return;
      }

      processingRef.current = true;
      console.log('이미지 편집 시작:', imageUri);

      // 원본 이미지가 있으면 원본을 사용하여 매번 새롭게 편집
      const sourceUri = originalImageUri || imageUri;

      // ImagePicker 라이브러리의 openCropper 사용
      ImagePicker.openCropper({
        path: sourceUri,
        width: 300,
        height: 300,
        cropperToolbarTitle: '이미지 편집',
        cropperToolbarColor: '#000000',
        cropperStatusBarColor: '#000000',
        cropperActiveWidgetColor: '#56AEE9',
        cropperToolbarWidgetColor: '#FFFFFF',
        loadingLabelText: '처리 중...',
        mediaType: 'photo',
        cropperChooseText: '적용',
        cropperCancelText: '취소',
        // 자유롭게 비율 조정 가능
        freeStyleCropEnabled: true,
        // 회전 활성화
        enableRotationGesture: true,
      })
        .then(image => {
          console.log('이미지 크롭 성공:', image.path);
          // 편집된 이미지 저장
          setCurrentImageUri(image.path);
          processingRef.current = false;
        })
        .catch(error => {
          console.log('이미지 크롭 취소 또는 오류:', error);
          processingRef.current = false;

          // 사용자가 취소한 경우는 무시
          if (error.code !== 'E_PICKER_CANCELLED') {
            Alert.alert('오류', '이미지 편집 중 문제가 발생했습니다.');
          }
        });
    } catch (error) {
      console.error('이미지 편집기 실행 중 오류:', error);
      processingRef.current = false;
      Alert.alert('오류', '이미지 편집을 시작할 수 없습니다.');
    }
  };

  // 박스명 가져오기
  const getShareBoxName = id => {
    const box = shareBoxes.find(item => item.id === id);
    return box ? box.name : '';
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

    if (!expiryDate) {
      Alert.alert('알림', '유효기간을 입력해주세요.');
      return;
    }

    // 금액형인 경우 금액 검증
    if (gifticonType === 'AMOUNT' && (!amount || isNaN(Number(amount)) || Number(amount) <= 0)) {
      Alert.alert('알림', '유효한 금액을 입력해주세요.');
      return;
    }

    // 여기서 등록 API 호출 또는 저장 로직을 구현
    // 예시: 등록 후 생성된 ID를 받아옴
    const mockRegisteredId = Date.now().toString();

    Alert.alert('성공', '기프티콘이 성공적으로 등록되었습니다.', [
      {
        text: '확인',
        onPress: () => {
          // 기프티콘 타입에 따라 다른 상세 화면으로 이동
          const targetScreen = gifticonType === 'PRODUCT' ? 'DetailProduct' : 'DetailAmount';
          navigation.navigate(targetScreen, {
            id: mockRegisteredId,
            scope: boxType,
            shareBoxId: shareBoxId,
          });
        },
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
            <TouchableOpacity style={styles.imageContainer} onPress={handleImageContainerPress}>
              {currentImageUri ? (
                <Image
                  source={imageSource(currentImageUri)}
                  style={styles.image}
                  resizeMode="cover"
                  key={`image-${Date.now()}`} // 강제 리렌더링을 위한 키 추가
                />
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
              onPress={showImageEditor}
            />
          </View>

          {/* 기프티콘 타입 및 박스 정보 */}
          <View style={styles.infoSection}>
            <TouchableOpacity
              style={[styles.infoRow, isTypeLocked && styles.disabledRow]}
              onPress={() => {
                if (!isTypeLocked) {
                  showBoxModal();
                } else {
                  Alert.alert('알림', '기프티콘 유형은 최초 등록 후 변경할 수 없습니다.');
                }
              }}
            >
              <Text variant="body1" weight="semiBold" style={styles.infoLabel}>
                기프티콘 타입
              </Text>
              {isTypeBoxSelected ? (
                <View style={styles.typeChip}>
                  <Text variant="body2" weight="regular" color="white">
                    {gifticonType === 'PRODUCT' ? '상품형' : '금액형'}
                  </Text>
                </View>
              ) : (
                <View style={styles.boxSelector}>
                  <Text variant="body2" style={[styles.boxText, { color: '#999' }]}>
                    선택해주세요
                  </Text>
                  <Icon name="chevron-right" size={20} color={theme.colors.gray400} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={showBoxModal}>
              <Text variant="body1" weight="semiBold" style={styles.infoLabel}>
                등록 위치
              </Text>
              {isTypeBoxSelected ? (
                <View style={styles.boxSelector}>
                  <Text variant="body2" style={styles.boxText}>
                    {boxType === 'MY_BOX' ? '마이박스' : getShareBoxName(shareBoxId)}
                  </Text>
                  <Icon name="chevron-right" size={20} color={theme.colors.gray400} />
                </View>
              ) : (
                <View style={styles.boxSelector}>
                  <Text variant="body2" style={[styles.boxText, { color: '#999' }]}>
                    선택해주세요
                  </Text>
                  <Icon name="chevron-right" size={20} color={theme.colors.gray400} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 입력 폼 - 타입 및 박스가 선택된 경우에만 활성화 */}
          {isTypeBoxSelected ? (
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

              {/* 금액형인 경우 금액 입력 필드 추가 */}
              {gifticonType === 'AMOUNT' && (
                <>
                  <Text variant="h4" weight="bold" style={styles.formSectionTitle}>
                    금액 정보 입력
                  </Text>
                  <InputLine
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="금액을 입력해주세요."
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                    rightIcon={<Text variant="body1">원</Text>}
                  />
                </>
              )}
            </View>
          ) : (
            <View style={styles.infoGuideContainer}>
              <RNEIcon name="info-outline" type="material" size={24} color="#4A90E2" />
              <Text style={styles.infoGuideText}>
                기프티콘 유형과 등록 위치를 선택하여 등록을 계속 진행해주세요.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 등록 버튼 */}
        <Button
          title="등록하기"
          onPress={handleRegister}
          variant="primary"
          size="lg"
          style={styles.button}
          disabled={!isTypeBoxSelected}
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

      {/* 박스 선택 모달 */}
      <Modal
        visible={isBoxModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          // 이미 선택되어 있는 경우에만 모달 닫기 가능
          if (isTypeBoxSelected) {
            setBoxModalVisible(false);
          } else {
            Alert.alert('알림', '기프티콘 타입과 등록 위치를 선택해주세요.');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.boxModalContent]}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              기프티콘 정보 선택
            </Text>

            {!isTypeLocked && (
              <>
                <Text variant="h5" weight="bold" style={styles.modalSubtitle}>
                  기프티콘 타입
                </Text>

                {/* 상품형/금액형 선택 버튼 */}
                <View style={styles.typeButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      gifticonType === 'PRODUCT' && styles.typeButtonSelected,
                    ]}
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
                    style={[
                      styles.typeButton,
                      gifticonType === 'AMOUNT' && styles.typeButtonSelected,
                    ]}
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
              </>
            )}

            <Text variant="h4" weight="bold" style={[styles.modalSubtitle, styles.sectionTitle]}>
              등록 위치
            </Text>

            <Text variant="h5" weight="bold" style={styles.modalSubtitle}>
              기본
            </Text>

            {/* 마이박스 선택 */}
            <View style={styles.boxSection}>
              <View style={styles.boxRow}>
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    boxType === 'MY_BOX' && styles.checkboxContainerSelected,
                  ]}
                  onPress={() => {
                    setBoxType('MY_BOX');
                    setShareBoxId(null);
                  }}
                >
                  <View style={styles.checkbox}>
                    {boxType === 'MY_BOX' && (
                      <Icon name="check" size={16} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>마이박스</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text variant="h5" weight="bold" style={[styles.modalSubtitle, styles.sectionTitle]}>
              쉐어 박스
            </Text>

            {/* 쉐어박스 선택 */}
            <View style={styles.boxSection}>
              {shareBoxes.map(box => (
                <View key={box.id} style={styles.boxRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxContainer,
                      boxType === 'SHARE_BOX' &&
                        shareBoxId === box.id &&
                        styles.checkboxContainerSelected,
                    ]}
                    onPress={() => {
                      setBoxType('SHARE_BOX');
                      setShareBoxId(box.id);
                    }}
                  >
                    <View style={styles.checkbox}>
                      {boxType === 'SHARE_BOX' && shareBoxId === box.id && (
                        <Icon name="check" size={16} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{box.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.boxButtonContainer}>
              <Button
                title="확인"
                variant="primary"
                onPress={handleBoxSelected}
                style={styles.boxModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 원본 이미지 팝업 모달 */}
      <Modal
        visible={isOriginalImageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOriginalImageVisible(false)}
      >
        <TouchableOpacity
          style={styles.originalImageModalOverlay}
          activeOpacity={1}
          onPress={() => setOriginalImageVisible(false)}
        >
          <View style={styles.originalImageModalContent}>
            <Image
              source={imageSource(originalImageUri)}
              style={styles.originalImage}
              resizeMode="contain"
            />

            {/* 원본 이미지에서 편집 시작 버튼 */}
            <TouchableOpacity
              style={styles.editFromOriginalButton}
              onPress={() => {
                setOriginalImageVisible(false);
                setTimeout(() => showImageEditor(originalImageUri), 300);
              }}
            >
              <Icon name="edit" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingVertical: 20,
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
    marginVertical: 15,
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
    marginTop: 10,
    width: 180,
  },
  infoSection: {
    backgroundColor: '#F9FAFC',
    borderRadius: 10,
    padding: 5,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
  },
  typeChip: {
    backgroundColor: '#718096',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  boxSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxText: {
    marginRight: 4,
    color: '#4A5568',
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
    marginBottom: 0,
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
  boxModalContent: {
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    marginBottom: 12,
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
  boxSection: {
    marginBottom: 10,
  },
  boxRow: {
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
  boxButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  boxModalButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 50,
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
  infoGuideContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  infoGuideText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
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
  disabledRow: {
    opacity: 0.8,
  },
  originalImageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalImageModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  originalImage: {
    width: '100%',
    height: '100%',
  },
  editFromOriginalButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(86, 174, 233, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default RegisterDetailScreen;
