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
import ImagePicker from 'react-native-image-crop-picker';
import {
  detectAndCropBarcode,
  detectBarcode,
  getBarcodeFormatName,
} from '../../../utils/BarcodeUtils';
import useGifticonStore from '../../../store/gifticonStore';

const RegisterDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Zustand 스토어에서 바코드 관련 기능 불러오기
  const setCurrentBarcodeInfo = useGifticonStore(state => state.setCurrentBarcodeInfo);

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

  // 바코드 관련 상태 추가
  const [barcodeImageUri, setBarcodeImageUri] = useState(null); // 잘라낸 바코드 이미지
  const [barcodeFormat, setBarcodeFormat] = useState(null); // 바코드 포맷 정보

  // 바코드 이미지 확인 모달
  const [isBarcodeImageVisible, setBarcodeImageVisible] = useState(false);

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
        console.log('[상세 화면] 편집된 이미지 로드:', imageUri);
        if (imageUri) {
          setCurrentImageUri(imageUri);

          // 원본 이미지 URI 처리
          if (route.params?.originalImage && route.params.originalImage.uri) {
            console.log('[상세 화면] 원본 이미지 로드:', route.params.originalImage.uri);
            setOriginalImageUri(route.params.originalImage.uri);
          } else {
            // 원본 이미지가 없는 경우 현재 이미지를 원본으로 설정
            setOriginalImageUri(imageUri);
          }
        } else {
          console.warn('[상세 화면] 유효하지 않은 이미지 URI');
        }
      } catch (error) {
        console.error('[상세 화면] 이미지 로드 중 오류:', error);
      }
    }

    // 바코드 정보 가져오기 (메인 화면에서 전달받은 정보)
    if (route.params?.barcodeValue) {
      console.log('[상세 화면] 이전 화면에서 전달받은 바코드:', route.params.barcodeValue);

      // 바코드 정보 설정
      setBarcode(route.params.barcodeValue);

      if (route.params?.barcodeFormat) {
        setBarcodeFormat(route.params.barcodeFormat);
      }

      // 바코드 이미지 정보 설정
      if (route.params?.barcodeImageUri) {
        console.log(
          '[상세 화면] 이전 화면에서 전달받은 바코드 이미지:',
          route.params.barcodeImageUri
        );
        setBarcodeImageUri(route.params.barcodeImageUri);
      }

      // Zustand 스토어에 바코드 정보 저장
      setCurrentBarcodeInfo(
        route.params.barcodeValue,
        route.params.barcodeFormat || null,
        route.params.barcodeBoundingBox || null
      );
    }

    // 기프티콘 타입 및 등록 위치 정보 가져오기
    if (route.params?.gifticonType) {
      setGifticonType(route.params.gifticonType);
      setIsTypeBoxSelected(true);
      // 유형이 이미 선택되었으므로 잠금 상태로 설정
      setIsTypeLocked(true);
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
  }, [route.params, setCurrentBarcodeInfo]);

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
      if (currentImageUri) {
        // 원본 이미지가 있는 경우에만 원본 이미지 모달 표시
        if (originalImageUri) {
          console.log('원본 이미지 모달 표시:', originalImageUri);
          setOriginalImageVisible(true);
        }
      } else {
        // 이미지가 없는 경우 이미지 옵션 모달 표시
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

  // 바코드 확인 함수 - 저장된 바코드 정보를 확인할 수 있도록 개선
  const showBarcodeImage = () => {
    // 디버깅 로그
    console.log('[기프티콘 등록] 바코드 확인 - 현재 바코드:', barcode);
    console.log('[기프티콘 등록] 바코드 이미지 URI:', barcodeImageUri);
    console.log('[기프티콘 등록] 현재 이미지 URI:', currentImageUri);
    console.log('[기프티콘 등록] 원본 이미지 URI:', originalImageUri);

    // 바코드 번호가 없으면 수동 입력 요청
    if (!barcode) {
      Alert.alert(
        '바코드 정보 없음',
        '인식된 바코드 번호가 없습니다. 바코드 번호를 수동으로 입력하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '바코드 인식 재시도',
            onPress: async () => {
              if (originalImageUri) {
                try {
                  console.log('[기프티콘 등록] 바코드 재인식 시도:', originalImageUri);
                  const result = await detectBarcode(originalImageUri);

                  if (result.success && result.barcodes.length > 0) {
                    const firstBarcode = result.barcodes[0];
                    setBarcode(firstBarcode.value);
                    setBarcodeFormat(firstBarcode.format);

                    // 바코드 이미지 영역 저장 시도
                    if (firstBarcode.boundingBox) {
                      try {
                        const cropResult = await detectAndCropBarcode(originalImageUri);
                        if (cropResult.success && cropResult.croppedImageUri) {
                          setBarcodeImageUri(cropResult.croppedImageUri);
                          console.log(
                            '[기프티콘 등록] 바코드 이미지 저장 성공:',
                            cropResult.croppedImageUri
                          );
                        }
                      } catch (cropError) {
                        console.error('[기프티콘 등록] 바코드 크롭 오류:', cropError);
                      }
                    }

                    // 바코드 정보 저장
                    setCurrentBarcodeInfo(
                      firstBarcode.value,
                      firstBarcode.format,
                      firstBarcode.boundingBox
                    );

                    // 바코드 이미지 모달 표시
                    setBarcodeImageVisible(true);
                  } else {
                    Alert.alert('알림', '바코드를 인식할 수 없습니다. 직접 입력해주세요.', [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '수동 입력',
                        onPress: () => {
                          Alert.prompt(
                            '바코드 번호 입력',
                            '바코드 번호를 직접 입력해주세요.',
                            [
                              { text: '취소', style: 'cancel' },
                              {
                                text: '저장',
                                onPress: value => {
                                  if (value && value.trim()) {
                                    setBarcode(value.trim());
                                    Alert.alert('완료', '바코드 번호가 저장되었습니다.');
                                  } else {
                                    Alert.alert('오류', '유효한 바코드 번호를 입력해주세요.');
                                  }
                                },
                              },
                            ],
                            'plain-text'
                          );
                        },
                      },
                    ]);
                  }
                } catch (error) {
                  console.error('[기프티콘 등록] 바코드 재인식 오류:', error);
                  Alert.alert('오류', '바코드 인식 중 문제가 발생했습니다.');
                }
              } else {
                Alert.alert('알림', '원본 이미지가 없습니다. 이미지를 다시 업로드해주세요.');
              }
            },
          },
          {
            text: '수동 입력',
            onPress: () => {
              Alert.prompt(
                '바코드 번호 입력',
                '바코드 번호를 직접 입력해주세요.',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '저장',
                    onPress: value => {
                      if (value && value.trim()) {
                        setBarcode(value.trim());
                        Alert.alert('완료', '바코드 번호가 저장되었습니다.');
                      } else {
                        Alert.alert('오류', '유효한 바코드 번호를 입력해주세요.');
                      }
                    },
                  },
                ],
                'plain-text'
              );
            },
          },
        ]
      );
      return;
    }

    // 바코드 정보 모달 표시
    setBarcodeImageVisible(true);
  };

  // 갤러리 선택 함수
  const handlePickImage = () => {
    setImageOptionVisible(true);
  };

  // 카메라로 촬영 함수
  const handleOpenCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('권한 없음', '카메라를 사용하기 위해 권한이 필요합니다.');
      return;
    }
    setImageOptionVisible(true);
  };

  // 이미지 편집기 실행 함수
  const showImageEditor = async imageUri => {
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
          // 편집된 이미지 저장
          setCurrentImageUri(image.path);
          processingRef.current = false;
        })
        .catch(error => {
          processingRef.current = false;

          // 사용자가 취소한 경우는 무시
          if (error.code !== 'E_PICKER_CANCELLED') {
            Alert.alert('오류', '이미지 편집 중 문제가 발생했습니다.');
          }
        });
    } catch (error) {
      console.error('이미지 편집 오류:', error);
      processingRef.current = false;
      Alert.alert('오류', '이미지 편집 중 문제가 발생했습니다. 다시 시도해주세요.');
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
              onPress={() => {
                if (currentImageUri) {
                  showImageEditor(currentImageUri);
                } else {
                  setImageOptionVisible(true);
                }
              }}
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
                rightIcon={
                  <TouchableOpacity onPress={showBarcodeImage}>
                    <Icon name="image" size={22} color="#333333" />
                  </TouchableOpacity>
                }
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
            <Text style={styles.originalImageGuideText}>업로드된 원본 이미지</Text>
            <Image
              source={imageSource(originalImageUri)}
              style={styles.originalImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 바코드 이미지 확인 모달 */}
      <Modal
        visible={isBarcodeImageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBarcodeImageVisible(false)}
      >
        <TouchableOpacity
          style={styles.originalImageModalOverlay}
          activeOpacity={1}
          onPress={() => setBarcodeImageVisible(false)}
        >
          <View style={styles.originalImageModalContent}>
            <View style={styles.barcodeModalHeader}>
              <Text style={styles.barcodeModalTitle}>바코드 정보</Text>
              <TouchableOpacity
                style={styles.originalImageCloseButton}
                onPress={() => setBarcodeImageVisible(false)}
              >
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {barcodeImageUri ? (
              <Image
                source={imageSource(barcodeImageUri)}
                style={styles.originalImage}
                resizeMode="contain"
              />
            ) : currentImageUri ? (
              <Image
                source={imageSource(currentImageUri)}
                style={styles.originalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>바코드 이미지가 없습니다.</Text>
              </View>
            )}

            <View style={styles.barcodeInfoContainer}>
              <View style={styles.barcodeInfoRow}>
                <Text style={styles.barcodeInfoLabel}>바코드 번호:</Text>
                <Text style={styles.barcodeInfoValue}>{barcode}</Text>
              </View>

              {barcodeFormat && (
                <View style={styles.barcodeInfoRow}>
                  <Text style={styles.barcodeInfoLabel}>바코드 형식:</Text>
                  <Text style={styles.barcodeInfoValue}>{getBarcodeFormatName(barcodeFormat)}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.barcodeCopyButton}
                onPress={() => {
                  Alert.alert('알림', `바코드 번호 ${barcode}이(가) 복사되었습니다.`);
                }}
              >
                <Icon name="content-copy" size={20} color="white" />
                <Text style={styles.barcodeCopyText}>바코드 복사</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  originalImageGuideText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    position: 'absolute',
    top: 20,
    textAlign: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    zIndex: 10,
  },
  originalImage: {
    width: '100%',
    height: '100%',
  },
  originalImageCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  barcodeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 10,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  barcodeModalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  barcodeInfoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  barcodeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barcodeInfoLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  barcodeInfoValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  barcodeCopyButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74, 144, 226, 0.7)',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  barcodeCopyText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#DDDDDD',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default RegisterDetailScreen;
