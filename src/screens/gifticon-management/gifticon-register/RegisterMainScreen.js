// 기프티콘 등록 스크린

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import { Text, LoadingOcrModal } from '../../../components/ui';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import { fetchShareBoxes } from '../../../api/shareBoxService';
import RNFS from 'react-native-fs';

// 네이티브 모듈 가져오기
const { BarcodeNativeModule } = NativeModules;

const RegisterMainScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const [gifticonType, setGifticonType] = useState('PRODUCT'); // 'PRODUCT' 또는 'AMOUNT'
  const [boxType, setBoxType] = useState('MY_BOX'); // 'MY_BOX' 또는 'SHARE_BOX'
  const [selectedShareBoxId, setSelectedShareBoxId] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false); // OCR 로딩 상태 추가
  const [shareBoxes, setShareBoxes] = useState([]); // 쉐어박스 목록 상태
  const [isLoadingShareBoxes, setIsLoadingShareBoxes] = useState(false); // 쉐어박스 로딩 상태

  // 쉐어박스 목록 불러오기
  const loadShareBoxes = async () => {
    try {
      setIsLoadingShareBoxes(true);
      const res = await fetchShareBoxes({ size: 20 });
      setShareBoxes(res.shareBoxes || []);
    } catch (e) {
      console.error('쉐어박스 목록 불러오기 실패:', e);
      Alert.alert('에러', '쉐어박스 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingShareBoxes(false);
    }
  };

  // 컴포넌트 마운트 시 쉐어박스 목록 불러오기
  useEffect(() => {
    loadShareBoxes();
  }, []);

  useEffect(() => {
    if (route.params?.sharedImageUri) {
      // 공유 인텐트가 있으면 타입/박스 선택 모달만 띄운다
      setTypeModalVisible(true);
    }
  }, [route.params?.sharedImageUri]);

  const handleSharedImage = async (imageUri) => {
    try {
      console.log('[공유 인텐트] handleSharedImage 진입:', imageUri);
      let finalUri = imageUri;
      // content:// URI라면 파일로 복사
      if (imageUri.startsWith('content://')) {
        try {
          const destPath = `${RNFS.CachesDirectoryPath}/shared_image_${Date.now()}.jpg`;
          await RNFS.copyFile(imageUri, destPath);
          finalUri = 'file://' + destPath;
          console.log('[공유 인텐트] content:// → file:// 변환:', finalUri);
        } catch (copyErr) {
          console.error('[공유 인텐트] content:// 파일 복사 실패:', copyErr);
          // 복사 실패 시 원본 URI 사용 (이미지 미리보기 실패 가능)
        }
      }
      // imageAsset 객체 생성
      const imageAsset = {
        uri: finalUri,
        type: 'image/jpeg',
        fileName: 'shared_image.jpg',
      };
      // 바코드 인식 유틸리티 불러오기
      const { detectBarcode, detectAndCropBarcode } = require('../../../utils/BarcodeUtils');
      let barcodeResult;
      let croppedBarcodeResult;
      // 바코드 인식
      console.log('[공유 인텐트] 바코드 인식 시작');
      if (BarcodeNativeModule) {
        try {
          barcodeResult = await detectBarcode(imageAsset.uri);
          console.log('[공유 인텐트] 네이티브 바코드 감지 결과:', JSON.stringify(barcodeResult));
          if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
            croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
          }
        } catch (nativeError) {
          console.error('[공유 인텐트] 네이티브 바코드 처리 오류:', nativeError);
          barcodeResult = await detectBarcode(imageAsset.uri);
          if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
            croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
          }
        }
      } else {
        barcodeResult = await detectBarcode(imageAsset.uri);
        console.log('[공유 인텐트] 바코드 인식 결과:', JSON.stringify(barcodeResult));
        if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
          croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
        }
      }
      let barcodeValue = null;
      let barcodeFormat = null;
      let barcodeBoundingBox = null;
      let barcodeImageUri = null;
      if (barcodeResult && barcodeResult.success && barcodeResult.barcodes.length > 0) {
        const firstBarcode = barcodeResult.barcodes[0];
        barcodeValue = firstBarcode.value;
        barcodeFormat = firstBarcode.format;
        barcodeBoundingBox = firstBarcode.boundingBox;
        const cornerPoints = firstBarcode.cornerPoints;
        console.log('[공유 인텐트] 바코드 코너 포인트:', cornerPoints);
        console.log('[공유 인텐트] 바코드 인식 성공:', barcodeValue, barcodeFormat);
        if (
          croppedBarcodeResult &&
          croppedBarcodeResult.success &&
          croppedBarcodeResult.croppedImageUri
        ) {
          barcodeImageUri = croppedBarcodeResult.croppedImageUri;
          console.log('[공유 인텐트] 바코드 이미지 크롭 성공:', barcodeImageUri);
          if (croppedBarcodeResult.cropInfo) {
            console.log('[공유 인텐트] 바코드 크롭 정보:', JSON.stringify(croppedBarcodeResult.cropInfo));
          }
        } else {
          console.warn('[공유 인텐트] 바코드 크롭 실패:', croppedBarcodeResult ? croppedBarcodeResult.message : '크롭 결과 없음');
        }
      }
      // 이미지 메타데이터 처리
      try {
        console.log('[공유 인텐트] 이미지 메타데이터 조회 시작');
        const gifticonService = require('../../../api/gifticonService').default;
        setIsOcrLoading(true);
        const imageMetadata = await gifticonService.getGifticonImageMetadata(
          {
            uri: imageAsset.uri,
            type: imageAsset.type,
            fileName: imageAsset.fileName,
          },
          gifticonType
        );
        setIsOcrLoading(false);
        console.log('[공유 인텐트] 이미지 메타데이터 조회 결과:', imageMetadata);
        setImageOptionVisible(false);
        navigation.navigate('RegisterDetail', {
          selectedImage: { uri: imageAsset.uri },
          originalImage: { uri: imageAsset.uri },
          gifticonType: gifticonType,
          boxType: boxType,
          shareBoxId: selectedShareBoxId,
          barcodeValue: barcodeValue,
          barcodeFormat: barcodeFormat,
          barcodeBoundingBox: barcodeBoundingBox,
          barcodeImageUri: barcodeImageUri,
          cornerPoints: barcodeResult?.barcodes?.[0]?.cornerPoints || null,
          cropInfo: croppedBarcodeResult?.cropInfo || null,
          gifticonMetadata: imageMetadata || null,
          ocrTrainingDataId: imageMetadata?.ocrTrainingDataId || null,
          brandName: imageMetadata?.brandName || null,
          brandId: imageMetadata?.brandId || null,
          gifticonName: imageMetadata?.gifticonName || null,
          gifticonExpiryDate: imageMetadata?.gifticonExpiryDate || null,
          gifticonOriginalAmount: imageMetadata?.gifticonOriginalAmount || null,
          gifticonBarcodeNumber: imageMetadata?.gifticonBarcodeNumber || barcodeValue || null,
          thumbnailImage: { uri: imageAsset.uri },
        });
      } catch (metadataError) {
        console.error('[공유 인텐트] 이미지 메타데이터 조회 오류:', metadataError);
        setIsOcrLoading(false);
        const errorMessage =
          metadataError.message?.includes('네트워크') ||
          metadataError.message?.includes('Network')
            ? '네트워크 연결을 확인해주세요. 오프라인 상태에서는 기프티콘 정보를 자동으로 인식할 수 없습니다.'
            : '기프티콘 정보 인식 중 오류가 발생했습니다.';
        Alert.alert('메타데이터 조회 실패', errorMessage, [
          {
            text: '직접 입력하기',
            onPress: () => {
              setImageOptionVisible(false);
              navigation.navigate('RegisterDetail', {
                selectedImage: { uri: imageAsset.uri },
                originalImage: { uri: imageAsset.uri },
                gifticonType: gifticonType,
                boxType: boxType,
                shareBoxId: selectedShareBoxId,
                barcodeValue: barcodeValue,
                barcodeFormat: barcodeFormat,
                barcodeBoundingBox: barcodeBoundingBox,
                barcodeImageUri: barcodeImageUri,
                cornerPoints: barcodeResult?.barcodes?.[0]?.cornerPoints || null,
                cropInfo: croppedBarcodeResult?.cropInfo || null,
                brandId: null,
                thumbnailImage: { uri: imageAsset.uri },
              });
            },
          },
          {
            text: '취소',
            style: 'cancel',
          },
        ]);
      }
    } catch (e) {
      setIsOcrLoading(false);
      console.error('[공유 인텐트] 이미지 처리 중 오류:', e);
      Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다.');
    }
  };

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 업로드 버튼 클릭 시 타입 및 위치 모달 먼저 표시
  const handleUploadPress = useCallback(() => {
    setTypeModalVisible(true);
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
      launchImageLibrary(options, async response => {
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
            try {
              // 바코드 인식 먼저 시도
              console.log('[메인] 바코드 인식 시도 시작');

              // 바코드 인식 유틸리티 불러오기
              const {
                detectBarcode,
                detectAndCropBarcode,
              } = require('../../../utils/BarcodeUtils');

              let barcodeResult;
              let croppedBarcodeResult;

              // BarcodeNativeModule을 사용하여 바코드 감지 (네이티브 모듈이 있는 경우)
              if (BarcodeNativeModule) {
                console.log('[메인] 네이티브 모듈로 바코드 감지 시도');
                try {
                  // 1. 바코드 감지 (네이티브)
                  barcodeResult = await detectBarcode(imageAsset.uri);
                  console.log('[메인] 네이티브 바코드 감지 결과:', JSON.stringify(barcodeResult));

                  // 2. 바코드 크롭 (네이티브)
                  if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
                    console.log('[메인] 네이티브 바코드 크롭 시도');
                    croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
                  }
                } catch (nativeError) {
                  console.error('[메인] 네이티브 바코드 처리 오류:', nativeError);
                  // 오류 발생 시 JS 방식으로 전환
                  barcodeResult = await detectBarcode(imageAsset.uri);
                  if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
                    croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
                  }
                }
              } else {
                // 네이티브 모듈이 없는 경우 JS 방식 사용
                console.log('[메인] JS 방식으로 바코드 감지 시도');
                // 1. 바코드 인식 (JS)
                barcodeResult = await detectBarcode(imageAsset.uri);
                console.log('[메인] 바코드 인식 결과:', JSON.stringify(barcodeResult));

                // 2. 바코드 영역 크롭 시도 (JS)
                if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
                  croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
                }
              }

              let barcodeValue = null;
              let barcodeFormat = null;
              let barcodeBoundingBox = null;
              let barcodeImageUri = null;

              if (barcodeResult && barcodeResult.success && barcodeResult.barcodes.length > 0) {
                // 바코드 인식 성공
                const firstBarcode = barcodeResult.barcodes[0];
                barcodeValue = firstBarcode.value;
                barcodeFormat = firstBarcode.format;
                barcodeBoundingBox = firstBarcode.boundingBox;

                // 코너 포인트 정보 추출 (더 정확한 바코드 영역 감지를 위해)
                const cornerPoints = firstBarcode.cornerPoints;
                console.log('[메인] 바코드 코너 포인트:', cornerPoints);

                console.log('[메인] 바코드 인식 성공:', barcodeValue, barcodeFormat);

                // 바코드 영역 크롭 성공했는지 확인
                if (
                  croppedBarcodeResult &&
                  croppedBarcodeResult.success &&
                  croppedBarcodeResult.croppedImageUri
                ) {
                  barcodeImageUri = croppedBarcodeResult.croppedImageUri;
                  console.log('[메인] 바코드 이미지 크롭 성공:', barcodeImageUri);

                  // 크롭 정보 로깅 (디버깅용)
                  if (croppedBarcodeResult.cropInfo) {
                    console.log(
                      '[메인] 바코드 크롭 정보:',
                      JSON.stringify(croppedBarcodeResult.cropInfo)
                    );
                  }
                } else {
                  console.warn(
                    '[메인] 바코드 크롭 실패:',
                    croppedBarcodeResult ? croppedBarcodeResult.message : '크롭 결과 없음'
                  );
                }
              }

              // 이미지 메타데이터 처리 추가
              try {
                console.log('[메인] 이미지 메타데이터 조회 시작');
                // gifticonService import 확인
                const gifticonService = require('../../../api/gifticonService').default;

                // OCR 로딩 모달 표시
                setIsOcrLoading(true);

                // 메타데이터 조회 요청
                const imageMetadata = await gifticonService.getGifticonImageMetadata(
                  {
                    uri: imageAsset.uri,
                    type: imageAsset.type || 'image/jpeg',
                    fileName: imageAsset.fileName || 'image.jpg',
                  },
                  gifticonType
                );

                // OCR 로딩 모달 숨김
                setIsOcrLoading(false);

                console.log('[메인] 이미지 메타데이터 조회 결과:', imageMetadata);

                // 바코드 정보와 함께 바로 상세 화면으로 이동
                setImageOptionVisible(false);

                // 메타데이터 및 바코드 인식 결과 정보와 함께 상세 화면으로 이동
                navigation.navigate('RegisterDetail', {
                  selectedImage: { uri: imageAsset.uri },
                  originalImage: { uri: imageAsset.uri },
                  gifticonType: gifticonType,
                  boxType: boxType,
                  shareBoxId: selectedShareBoxId,
                  // 바코드 정보 추가
                  barcodeValue: barcodeValue,
                  barcodeFormat: barcodeFormat,
                  barcodeBoundingBox: barcodeBoundingBox,
                  barcodeImageUri: barcodeImageUri,
                  // 코너 포인트 정보 추가 (더 정확한 바코드 영역 정보)
                  cornerPoints: barcodeResult?.barcodes?.[0]?.cornerPoints || null,
                  // 크롭 정보 추가 (디버깅 및 UI 표시용)
                  cropInfo: croppedBarcodeResult?.cropInfo || null,
                  // 메타데이터 정보 추가
                  gifticonMetadata: imageMetadata || null,
                  // OCR 학습 데이터 ID 추가
                  ocrTrainingDataId: imageMetadata?.ocrTrainingDataId || null,
                  // 기타 메타데이터 정보들
                  brandName: imageMetadata?.brandName || null,
                  brandId: imageMetadata?.brandId || null,
                  gifticonName: imageMetadata?.gifticonName || null,
                  gifticonExpiryDate: imageMetadata?.gifticonExpiryDate || null,
                  gifticonOriginalAmount: imageMetadata?.gifticonOriginalAmount || null,
                  gifticonBarcodeNumber:
                    imageMetadata?.gifticonBarcodeNumber || barcodeValue || null,
                  // API 요청을 위한 추가 정보
                  thumbnailImage: { uri: imageAsset.uri }, // 원본 이미지와 동일한 URI 사용 (추후 리사이징 필요)
                });
              } catch (metadataError) {
                console.error('[메인] 이미지 메타데이터 조회 오류:', metadataError);

                // OCR 로딩 모달 숨김
                setIsOcrLoading(false);

                // 네트워크 오류 확인
                const errorMessage =
                  metadataError.message.includes('네트워크') ||
                  metadataError.message.includes('Network')
                    ? '네트워크 연결을 확인해주세요. 오프라인 상태에서는 기프티콘 정보를 자동으로 인식할 수 없습니다.'
                    : '기프티콘 정보 인식 중 오류가 발생했습니다.';

                // 사용자에게 알림
                Alert.alert('메타데이터 조회 실패', errorMessage, [
                  {
                    text: '직접 입력하기',
                    onPress: () => {
                      // 메타데이터 조회 실패해도 기본 정보만이라도 전달
                      setImageOptionVisible(false);
                      navigation.navigate('RegisterDetail', {
                        selectedImage: { uri: imageAsset.uri },
                        originalImage: { uri: imageAsset.uri },
                        gifticonType: gifticonType,
                        boxType: boxType,
                        shareBoxId: selectedShareBoxId,
                        // 바코드 정보만 추가
                        barcodeValue: barcodeValue,
                        barcodeFormat: barcodeFormat,
                        barcodeBoundingBox: barcodeBoundingBox,
                        barcodeImageUri: barcodeImageUri,
                        cornerPoints: barcodeResult?.barcodes?.[0]?.cornerPoints || null,
                        cropInfo: croppedBarcodeResult?.cropInfo || null,
                        // API 요청을 위한 추가 정보
                        brandId: null,
                        thumbnailImage: { uri: imageAsset.uri }, // 원본 이미지와 동일한 URI 사용
                      });
                    },
                  },
                  {
                    text: '취소',
                    style: 'cancel',
                  },
                ]);
              }
            } catch (processingError) {
              console.error('이미지 처리 중 오류:', processingError);
              Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다.');
            }
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
  }, [navigation, gifticonType, boxType, selectedShareBoxId]);

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
      launchCamera(options, async response => {
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
            try {
              // 바코드 인식 먼저 시도
              console.log('[메인] 카메라 바코드 인식 시도 시작');

              // 바코드 인식 유틸리티 불러오기
              const {
                detectBarcode,
                detectAndCropBarcode,
              } = require('../../../utils/BarcodeUtils');

              let barcodeResult;
              let croppedBarcodeResult;

              // BarcodeNativeModule을 사용하여 바코드 감지 (네이티브 모듈이 있는 경우)
              if (BarcodeNativeModule) {
                console.log('[메인] 네이티브 모듈로 카메라 바코드 감지 시도');
                try {
                  // 1. 바코드 감지 (네이티브)
                  barcodeResult = await detectBarcode(imageAsset.uri);
                  console.log(
                    '[메인] 네이티브 카메라 바코드 감지 결과:',
                    JSON.stringify(barcodeResult)
                  );

                  // 2. 바코드 크롭 (네이티브)
                  if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
                    console.log('[메인] 네이티브 카메라 바코드 크롭 시도');
                    croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
                  }
                } catch (nativeError) {
                  console.error('[메인] 네이티브 카메라 바코드 처리 오류:', nativeError);
                  // 오류 발생 시 JS 방식으로 전환
                  barcodeResult = await detectBarcode(imageAsset.uri);
                  if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
                    croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
                  }
                }
              } else {
                // 네이티브 모듈이 없는 경우 JS 방식 사용
                console.log('[메인] JS 방식으로 카메라 바코드 감지 시도');
                // 1. 바코드 인식 (JS)
                barcodeResult = await detectBarcode(imageAsset.uri);
                console.log('[메인] 카메라 바코드 인식 결과:', JSON.stringify(barcodeResult));

                // 2. 바코드 영역 크롭 시도 (JS)
                if (barcodeResult.success && barcodeResult.barcodes.length > 0) {
                  croppedBarcodeResult = await detectAndCropBarcode(imageAsset.uri);
                }
              }

              let barcodeValue = null;
              let barcodeFormat = null;
              let barcodeBoundingBox = null;
              let barcodeImageUri = null;

              if (barcodeResult && barcodeResult.success && barcodeResult.barcodes.length > 0) {
                // 바코드 인식 성공
                const firstBarcode = barcodeResult.barcodes[0];
                barcodeValue = firstBarcode.value;
                barcodeFormat = firstBarcode.format;
                barcodeBoundingBox = firstBarcode.boundingBox;

                // 코너 포인트 정보 추출 (더 정확한 바코드 영역 감지를 위해)
                const cornerPoints = firstBarcode.cornerPoints;
                console.log('[메인] 카메라 바코드 코너 포인트:', cornerPoints);

                console.log('[메인] 카메라 바코드 인식 성공:', barcodeValue, barcodeFormat);

                // 바코드 영역 크롭 성공했는지 확인
                if (
                  croppedBarcodeResult &&
                  croppedBarcodeResult.success &&
                  croppedBarcodeResult.croppedImageUri
                ) {
                  barcodeImageUri = croppedBarcodeResult.croppedImageUri;
                  console.log('[메인] 카메라 바코드 이미지 크롭 성공:', barcodeImageUri);

                  // 크롭 정보 로깅 (디버깅용)
                  if (croppedBarcodeResult.cropInfo) {
                    console.log(
                      '[메인] 카메라 바코드 크롭 정보:',
                      JSON.stringify(croppedBarcodeResult.cropInfo)
                    );
                  }
                } else {
                  console.warn(
                    '[메인] 바코드 크롭 실패:',
                    croppedBarcodeResult ? croppedBarcodeResult.message : '크롭 결과 없음'
                  );
                }
              }

              // 이미지 메타데이터 처리 추가
              try {
                console.log('[메인] 카메라 이미지 메타데이터 조회 시작');
                // gifticonService import 확인
                const gifticonService = require('../../../api/gifticonService').default;

                // OCR 로딩 모달 표시
                setIsOcrLoading(true);

                // 메타데이터 조회 요청
                const imageMetadata = await gifticonService.getGifticonImageMetadata(
                  {
                    uri: imageAsset.uri,
                    type: imageAsset.type || 'image/jpeg',
                    fileName: imageAsset.fileName || 'image.jpg',
                  },
                  gifticonType
                );

                // OCR 로딩 모달 숨김
                setIsOcrLoading(false);

                console.log('[메인] 카메라 이미지 메타데이터 조회 결과:', imageMetadata);

                // 바코드 정보와 함께 바로 상세 화면으로 이동
                setImageOptionVisible(false);

                // 메타데이터 및 바코드 인식 결과 정보와 함께 상세 화면으로 이동
                navigation.navigate('RegisterDetail', {
                  selectedImage: { uri: imageAsset.uri },
                  originalImage: { uri: imageAsset.uri },
                  gifticonType: gifticonType,
                  boxType: boxType,
                  shareBoxId: selectedShareBoxId,
                  // 바코드 정보 추가
                  barcodeValue: barcodeValue,
                  barcodeFormat: barcodeFormat,
                  barcodeBoundingBox: barcodeBoundingBox,
                  barcodeImageUri: barcodeImageUri,
                  // 코너 포인트 정보 추가 (더 정확한 바코드 영역 정보)
                  cornerPoints: barcodeResult?.barcodes?.[0]?.cornerPoints || null,
                  // 크롭 정보 추가 (디버깅 및 UI 표시용)
                  cropInfo: croppedBarcodeResult?.cropInfo || null,
                  // 메타데이터 정보 추가
                  gifticonMetadata: imageMetadata || null,
                  // OCR 학습 데이터 ID 추가
                  ocrTrainingDataId: imageMetadata?.ocrTrainingDataId || null,
                  // 기타 메타데이터 정보들
                  brandName: imageMetadata?.brandName || null,
                  brandId: imageMetadata?.brandId || null,
                  gifticonName: imageMetadata?.gifticonName || null,
                  gifticonExpiryDate: imageMetadata?.gifticonExpiryDate || null,
                  gifticonOriginalAmount: imageMetadata?.gifticonOriginalAmount || null,
                  gifticonBarcodeNumber:
                    imageMetadata?.gifticonBarcodeNumber || barcodeValue || null,
                  // API 요청을 위한 추가 정보
                  thumbnailImage: { uri: imageAsset.uri }, // 원본 이미지와 동일한 URI 사용 (추후 리사이징 필요)
                });
              } catch (metadataError) {
                console.error('[메인] 카메라 이미지 메타데이터 조회 오류:', metadataError);

                // OCR 로딩 모달 숨김
                setIsOcrLoading(false);

                // 네트워크 오류 확인
                const errorMessage =
                  metadataError.message.includes('네트워크') ||
                  metadataError.message.includes('Network')
                    ? '네트워크 연결을 확인해주세요. 오프라인 상태에서는 기프티콘 정보를 자동으로 인식할 수 없습니다.'
                    : '기프티콘 정보 인식 중 오류가 발생했습니다.';

                // 사용자에게 알림
                Alert.alert('메타데이터 조회 실패', errorMessage, [
                  {
                    text: '직접 입력하기',
                    onPress: () => {
                      // 메타데이터 조회 실패해도 기본 정보만이라도 전달
                      setImageOptionVisible(false);
                      navigation.navigate('RegisterDetail', {
                        selectedImage: { uri: imageAsset.uri },
                        originalImage: { uri: imageAsset.uri },
                        gifticonType: gifticonType,
                        boxType: boxType,
                        shareBoxId: selectedShareBoxId,
                        // 바코드 정보만 추가
                        barcodeValue: barcodeValue,
                        barcodeFormat: barcodeFormat,
                        barcodeBoundingBox: barcodeBoundingBox,
                        barcodeImageUri: barcodeImageUri,
                        cornerPoints: barcodeResult?.barcodes?.[0]?.cornerPoints || null,
                        cropInfo: croppedBarcodeResult?.cropInfo || null,
                        // API 요청을 위한 추가 정보
                        brandId: null,
                        thumbnailImage: { uri: imageAsset.uri }, // 원본 이미지와 동일한 URI 사용
                      });
                    },
                  },
                  {
                    text: '취소',
                    style: 'cancel',
                  },
                ]);
              }
            } catch (processingError) {
              console.error('카메라 이미지 처리 중 오류:', processingError);
              Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다.');
            }
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
  }, [navigation, requestCameraPermission, gifticonType, boxType, selectedShareBoxId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* OCR 로딩 모달 */}
      <LoadingOcrModal visible={isOcrLoading} message="이미지 분석 중입니다..." />

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
          <TouchableOpacity onPress={handleUploadPress}>
            <Card style={styles.uploadCard}>
              <View style={styles.uploadContent}>
                <LottieView
                  source={require('../../../assets/lottie/upload_anmation.json')}
                  autoPlay
                  loop
                  style={styles.uploadIcon}
                />
                <Text variant="h2" weight="bold" style={styles.uploadTitleMargin}>
                  기프티콘 업로드
                </Text>
                <Text variant="h5" weight="regular" color="#737373" style={styles.textCenter}>
                  지금 바로 갤러리에 저장된
                </Text>
                <Text variant="h5" weight="regular" color="#737373" style={styles.textCenter}>
                  기프티콘을 업로드 해보세요.
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </Shadow>

        {/* 수동 등록 버튼 - TouchableOpacity로 간단하게 구현
        <TouchableOpacity style={styles.manualButton} onPress={handleManualRegister}>
          <Text variant="h4" weight="semiBold" color="white" style={styles.manualTextMain}>
            수동 등록
          </Text>
          <Text variant="body2" weight="regular" color="white" style={styles.manualTextSub}>
            등록에 문제가 발생하셨나요?
          </Text>
        </TouchableOpacity> */}

        <View style={styles.divider} />

        {/* 등록하신 기프티콘은... 섹션 */}
        <View style={styles.infoSection}>
          <Text variant="h2" weight="bold">
            등록하신 기프티콘은
          </Text>
          <Text variant="h2" weight="bold">
            다음과 같은 절차로 관리돼요.
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

      {/* 기프티콘 타입 및 등록 위치 선택 모달 */}
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
              쉐어박스
            </Text>

            {/* 쉐어박스 선택 */}
            <View style={styles.boxSection}>
              {isLoadingShareBoxes ? (
                <View style={styles.loadingContainer}>
                  <Text>쉐어박스 목록을 불러오는 중...</Text>
                </View>
              ) : shareBoxes.length > 0 ? (
                <ScrollView style={styles.shareBoxScrollView} showsVerticalScrollIndicator={false}>
                  {shareBoxes.map(box => (
                    <View key={box.shareBoxId} style={styles.typeRow}>
                      <TouchableOpacity
                        style={[
                          styles.checkboxContainer,
                          boxType === 'SHARE_BOX' &&
                            selectedShareBoxId === box.shareBoxId &&
                            styles.checkboxContainerSelected,
                        ]}
                        onPress={() => {
                          setBoxType('SHARE_BOX');
                          setSelectedShareBoxId(box.shareBoxId);
                        }}
                      >
                        <View style={styles.checkbox}>
                          {boxType === 'SHARE_BOX' && selectedShareBoxId === box.shareBoxId && (
                            <Icon
                              name="check"
                              type="material"
                              size={16}
                              color={theme.colors.primary}
                            />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>{box.shareBoxName}</Text>
                        <View style={styles.ownerContainer}>
                          <Icon
                            name="person"
                            type="material"
                            size={14}
                            color={box.isOwner ? '#4A90E2' : '#999'}
                          />
                          <Text
                            style={[styles.ownerText, box.isOwner && styles.ownerTextHighlight]}
                          >
                            {box.ownerName || box.shareBoxUserName || '나'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyShareBoxContainer}>
                  <Text style={styles.emptyShareBoxText}>참여 중인 쉐어박스가 없습니다.</Text>
                </View>
              )}
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
                onPress={() => {
                  setTypeModalVisible(false);
                  if (route.params?.sharedImageUri) {
                    // 공유 인텐트 이미지가 있으면 바로 처리
                    handleSharedImage(route.params.sharedImageUri);
                  } else {
                    // 기존처럼 이미지 선택 모달 노출
                    setImageOptionVisible(true);
                  }
                }}
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
  // manualButton: {
  //   backgroundColor: '#BBC1D0',
  //   borderRadius: 10,
  //   height: 65,
  //   marginBottom: 15,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: '100%',
  // },
  // manualTextMain: {
  //   marginBottom: 0,
  // },
  // manualTextSub: {
  //   opacity: 0.8,
  // },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 5,
    marginBottom: 25,
  },
  infoSection: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  stepsContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
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
    paddingHorizontal: 12,
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
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  ownerText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  },
  ownerTextHighlight: {
    color: '#4A90E2',
    fontWeight: '500',
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyShareBoxContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyShareBoxText: {
    color: '#666',
    fontSize: 14,
  },
  shareBoxScrollView: {
    maxHeight: 250, // 스크롤 영역 최대 높이 설정
  },
});

export default RegisterMainScreen;
