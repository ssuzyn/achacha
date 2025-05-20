// 쉐어박스 상세 상품형 스크린

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import AlertDialog from '../../components/ui/AlertDialog';
import { useTheme } from '../../hooks/useTheme';
import { useTabBar } from '../../context/TabBarContext';
import NavigationService from '../../navigation/NavigationService';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import useAuthStore from '../../store/authStore';
import apiClient from '../../api/apiClient';
import { cancelShareGifticon } from '../../api/shareBoxService';
import gifticonService from '../../api/gifticonService';

const BoxDetailProductScreen = () => {
  console.log('🔥 BoxDetailProductScreen 진입!');
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { showTabBar } = useTabBar();
  const myUserId = useAuthStore(state => state.userId);

  // scope 상태 관리
  const [scope, setScope] = useState('SHARE_BOX'); // 'SHARE_BOX' 또는 'USED'
  // 기프티콘 ID 관리
  const [gifticonId, setGifticonId] = useState(null);
  // 사용 유형 관리 (사용완료 경우에만)
  const [usageType, setUsageType] = useState(null);
  // 사용일시 관리 (사용완료 경우에만)
  const [usedAt, setUsedAt] = useState(null);
  // 기프티콘 데이터 상태
  const [gifticonData, setGifticonData] = useState(null);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);
  // AlertDialog 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('delete'); // 'delete' 또는 'cancelShare'
  // 공유 모달 상태 관리
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  // 공유 위치 선택 상태
  const [shareBoxType, setShareBoxType] = useState('SHARE_BOX');
  const [selectedShareBoxId, setSelectedShareBoxId] = useState(null);
  // 바코드 정보 별도 상태로 분리
  const [barcodeInfo, setBarcodeInfo] = useState(null);

  // 더미 데이터: 쉐어박스 목록
  const shareBoxes = [
    { id: 1, name: '으라차차 해인네' },
    { id: 2, name: '으라차차 주은이네' },
    { id: 3, name: '으라차차 대성이네' },
  ];

  // 바텀탭 표시 - 화면이 포커스될 때마다 표시 보장
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();
    });

    // 초기 로드 시에도 바텀탭 표시
    showTabBar();

    return unsubscribe;
  }, [navigation, showTabBar]);

  // 페이지 진입 시 gifticonId를 추출해서 무조건 API 호출
  useEffect(() => {
    let id = null;
    if (route.params?.gifticonId) {
      id = route.params.gifticonId;
    } else if (route.params?.gifticon?.gifticonId) {
      id = route.params.gifticon.gifticonId;
    }
    if (id) {
      setGifticonId(id);
      loadGifticonData(id); // 무조건 API 호출
    }
  }, [route.params]);

  // 기프티콘 ID가 있으면 데이터 로드
  useEffect(() => {
    if (gifticonId) {
      loadGifticonData(gifticonId);
    }
  }, [gifticonId]);

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 기프티콘 데이터 로드 함수
  const loadGifticonData = async id => {
    setIsLoading(true);
    try {
      let response, data;
      if (scope === 'USED') {
        response = await apiClient.get(`/api/used-gifticons/${id}`);
        data = response.data;
      } else {
        response = await apiClient.get(`/api/available-gifticons/${id}`);
        data = response.data;
      }
      console.log('[DEBUG] gifticon API 응답:', data);
      setGifticonData(prev => {
        const merged = {
          ...prev,
          ...data,
          gifticonCreatedAt: data.createdAt || data.gifticonCreatedAt,
        };
        console.log('[DEBUG] gifticonCreatedAt:', merged.gifticonCreatedAt);
        return merged;
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // 바코드 정보 로드 함수
  const loadBarcodeInfo = async id => {
    try {
      const barcodeRes = await gifticonService.getAvailableGifticonBarcode(id);
      setBarcodeInfo(barcodeRes);
      setGifticonData(prev => {
        const updated = {
          ...prev,
          barcodeImageUrl: barcodeRes.barcodePath,
          barcodeNumber: barcodeRes.gifticonBarcodeNumber,
        };
        console.log('바코드 API 응답:', barcodeRes);
        console.log('업데이트된 gifticonData:', updated);
        return updated;
      });
    } catch (error) {
      console.log('바코드 조회 실패:', error?.message || '바코드 정보를 불러오지 못했습니다.');
    }
  };

  // 날짜 포맷 함수 (YYYY.MM.DD)
  const formatDate = dateString => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  // 날짜 포맷 함수 (YYYY.MM.DD HH:MM)
  const formatDateTime = dateString => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  // 사용완료된 상품일 경우 다른 UI 표시
  const isUsed = scope === 'USED';

  // 사용 방식에 따른 텍스트 결정
  const getUsageTypeText = () => {
    switch (gifticonData.usageType) {
      case 'SELF_USE':
        return '사용완료';
      case 'PRESENT':
        return '선물완료';
      case 'GIVE_AWAY':
        return '뿌리기 완료';
      default:
        return '사용완료';
    }
  };

  // D-day 계산 함수
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 설정
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // 만료 날짜의 시간을 00:00:00으로 설정

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return '만료됨';
    } else if (diffDays === 0) {
      return 'D-day';
    }
    return diffDays;
  };

  // 공유하기 기능 - 모달 표시로 변경
  const handleShare = () => {
    // 기본 쉐어박스 선택 초기화
    setShareBoxType('SHARE_BOX');
    if (shareBoxes.length > 0) {
      setSelectedShareBoxId(shareBoxes[0].id);
    }

    // 공유 모달 표시
    setShareModalVisible(true);
  };

  // 공유 완료 처리
  const handleShareConfirm = async () => {
    if (shareBoxType === 'SHARE_BOX' && !selectedShareBoxId) {
      Alert.alert('알림', '공유할 쉐어박스를 선택해주세요.');
      return;
    }

    try {
      // 실제 API 호출
      await apiClient.post(`/api/share-boxes/${selectedShareBoxId}/gifticons/${gifticonId}`);

      Alert.alert('성공', '기프티콘이 성공적으로 공유되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            setShareModalVisible(false);
          },
        },
      ]);
    } catch (error) {
      // 에러코드 기반 메시지 처리
      const errorCode = error?.response?.data?.code;
      const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;

      Alert.alert('공유 실패', errorMessage);
    }
  };

  // 공유 모달 닫기
  const handleCloseShareModal = () => {
    setShareModalVisible(false);
  };

  // 사용하기 기능
  const handleUse = async () => {
    // 만료된 경우 바로 사용완료 처리
    const isExpired = calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨';

    if (isExpired || isUsing) {
      // 이미 사용 중인 경우 또는 만료된 경우 실제 사용완료 API 호출
      try {
        setIsLoading(true);
        if (gifticonData.gifticonType === 'PRODUCT') {
          await gifticonService.markProductGifticonAsUsed(gifticonData.gifticonId);
        } else {
          await gifticonService.markGifticonAsUsed(gifticonData.gifticonId, 'SELF_USE');
        }
        Alert.alert('성공', '기프티콘이 사용완료 처리되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              navigation.navigate('BoxList', {
                shareBoxId: gifticonData.shareBoxId,
                shareBoxName: gifticonData.shareBoxName,
                initialTab: 'available',
                refresh: true,
              });
            },
          },
        ]);
      } catch (error) {
        Alert.alert(
          '사용완료 실패',
          error?.response?.data?.message || '기프티콘 사용완료 처리에 실패했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // 만료되지 않은 경우 바코드 이미지 조회 후 사용 모드로 전환
      try {
        setIsLoading(true);
        await loadBarcodeInfo(gifticonData.gifticonId);
        setIsUsing(true);
      } catch (error) {
        Alert.alert('바코드 조회 실패', error?.message || '바코드 이미지를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 사용 취소 기능
  const handleCancel = () => {
    setIsUsing(false);
  };

  // 돋보기 기능 - 확대 화면으로 이동
  const handleMagnify = () => {
    navigation.navigate('UseProductScreen', {
      id: gifticonData.gifticonId,
      barcodeNumber: gifticonData.barcodeNumber,
    });
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 로직 구현
    // console.log('기프티콘 선물하기');
  };

  // 기프티콘 삭제 다이얼로그 표시
  const handleDelete = () => {
    setAlertType('delete');
    setAlertVisible(true);
  };

  // 공유 취소 다이얼로그 표시
  const handleCancelShare = () => {
    setAlertType('cancelShare');
    setAlertVisible(true);
  };

  // 다이얼로그 확인 버튼 처리
  const handleConfirm = async () => {
    setAlertVisible(false);

    if (alertType === 'delete') {
      // 삭제 처리 로직
      // 실제 구현에서는 API 호출로 기프티콘 삭제
      // console.log('기프티콘 삭제:', gifticonId);

      // 리스트 화면으로 이동
      navigation.goBack();
    } else if (alertType === 'cancelShare') {
      // 공유 취소 처리 로직
      try {
        await cancelShareGifticon(gifticonData.shareBoxId, gifticonData.gifticonId);
        Alert.alert('성공', '기프티콘 공유가 취소되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error) {
        console.log('공유 취소 에러:', error?.response);
        const errorCode = error?.response?.data?.code;
        const errorMessage =
          ERROR_MESSAGES[errorCode] ||
          error?.response?.data?.message ||
          '알 수 없는 오류가 발생했습니다.';
        Alert.alert('공유 취소 실패', errorMessage);
      }
    }
  };

  // 다이얼로그 취소 버튼 처리
  const handleCancelDialog = () => {
    setAlertVisible(false);
  };

  console.log('BoxDetailProductScreen 렌더링, route:', route);
  console.log('BoxDetailProductScreen 렌더링, route.params:', route.params);

  useEffect(() => {
    if (route.params?.gifticon) {
      const gifticon = route.params.gifticon;
      const normalizedGifticon = {
        ...gifticon,
        shareBoxId: gifticon.shareBoxId || gifticon.shareboxId,
        shareBoxName: gifticon.shareBoxName || gifticon.shareboxName,
      };
      setGifticonData(normalizedGifticon);
      setScope(normalizedGifticon.scope || 'SHARE_BOX');
      setIsLoading(false);
    }
  }, [route.params]);

  useEffect(() => {
    console.log('gifticonData 변경:', gifticonData);
    console.log('isLoading 변경:', isLoading);
  }, [gifticonData, isLoading]);

  if (isLoading || !gifticonData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
            <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          </TouchableOpacity>
          <Text variant="h3" weight="bold" style={styles.headerTitle}>
            기프티콘 상세
          </Text>
          <View style={styles.rightPlaceholder} />
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />
      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 상세
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <View style={styles.contentContainer}>
          {/* 카드 영역 */}
          <View style={styles.cardContainer}>
            {/* 기프티콘 이미지 및 정보 카드 */}
            <View style={styles.gifticonCard}>
              {isUsing ? (
                // 사용 모드일 때 바코드 표시
                <View style={styles.barcodeContainer}>
                  <Image
                    source={{ uri: gifticonData.barcodeImageUrl }}
                    style={styles.barcodeImage}
                    resizeMode="contain"
                  />
                  <View style={styles.barcodeNumberContainer}>
                    <Text style={styles.barcodeNumberText}>{gifticonData.barcodeNumber}</Text>
                    <TouchableOpacity style={styles.magnifyButton} onPress={handleMagnify}>
                      <Icon name="search" type="material" size={24} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // 기프티콘 이미지 표시 (사용완료면 흑백 처리)
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: gifticonData.thumbnailPath }}
                    style={[
                      styles.gifticonImage,
                      isUsed && styles.grayScaleImage,
                      isUsed &&
                        gifticonData.usageType === 'SELF_USE' &&
                        styles.smallerGifticonImage,
                    ]}
                    resizeMode="contain"
                  />

                  {/* 상단 액션 아이콘 */}
                  {!isUsed && (
                    <View style={styles.actionIconsContainer}>
                      {/* 마이박스일 경우 삭제 아이콘만 표시 */}
                      {scope === 'MY_BOX' && (
                        <TouchableOpacity style={styles.actionIconButton} onPress={handleDelete}>
                          <Icon name="delete" type="material" size={24} color="#718096" />
                        </TouchableOpacity>
                      )}

                      {/* 쉐어박스이고 내가 공유한 경우에만 공유 취소 아이콘 표시 */}
                      {scope === 'SHARE_BOX' && gifticonData.userId === Number(myUserId) && (
                        <TouchableOpacity
                          style={styles.actionIconButton}
                          onPress={handleCancelShare}
                        >
                          <Icon name="person-remove" type="material" size={24} color="#718096" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* SELF_USE 유형의 사용완료 기프티콘인 경우 바코드 표시 */}
                  {isUsed && gifticonData.usageType === 'SELF_USE' && (
                    <View style={styles.usedBarcodeContainer}>
                      <Image
                        source={
                          gifticonData.barcodeImageUrl || require('../../assets/images/barcode.png')
                        }
                        style={styles.usedBarcodeImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.usedBarcodeNumberText}>
                        {gifticonData.barcodeNumber || '8013-7621-1234-5678'}
                      </Text>
                    </View>
                  )}

                  {isUsed && (
                    <View style={styles.usedOverlay}>
                      <Text style={styles.usedText}>{getUsageTypeText()}</Text>
                    </View>
                  )}

                  {!isUsed && (
                    <View
                      style={[
                        styles.ddayButtonContainer,
                        typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string' &&
                        calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨'
                          ? styles.expiredButtonContainer
                          : calculateDaysLeft(gifticonData.gifticonExpiryDate) <= 7 &&
                              calculateDaysLeft(gifticonData.gifticonExpiryDate) !== 'D-day'
                            ? styles.urgentDDayContainer
                            : calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'D-day'
                              ? styles.urgentDDayContainer
                              : styles.normalDDayContainer,
                      ]}
                    >
                      <Text
                        weight="bold"
                        style={[
                          styles.ddayButtonText,
                          typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string' &&
                          calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨'
                            ? styles.expiredButtonText
                            : calculateDaysLeft(gifticonData.gifticonExpiryDate) <= 7 &&
                                calculateDaysLeft(gifticonData.gifticonExpiryDate) !== 'D-day'
                              ? styles.urgentDDayText
                              : calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'D-day'
                                ? styles.urgentDDayText
                                : styles.normalDDayText,
                        ]}
                      >
                        {typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string'
                          ? calculateDaysLeft(gifticonData.gifticonExpiryDate)
                          : calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'D-day'
                            ? 'D-day'
                            : `D-${calculateDaysLeft(gifticonData.gifticonExpiryDate)}`}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{gifticonData.brandName}</Text>
                <Text weight="bold" style={styles.nameText}>
                  {gifticonData.gifticonName}
                </Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>유효기간</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(gifticonData.gifticonExpiryDate)}
                  </Text>
                </View>

                {/* 등록일시: 항상 표시 */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>등록일시</Text>
                  <Text style={styles.infoValue}>
                    {gifticonData.gifticonCreatedAt
                      ? formatDateTime(gifticonData.gifticonCreatedAt)
                      : '-'}
                  </Text>
                </View>

                {/* 등록자 정보 표시 (항상 표시) */}
                {gifticonData.userName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>등록자</Text>
                    <Text style={styles.infoValue}>{gifticonData.userName}</Text>
                  </View>
                )}

                {/* 쉐어박스 정보 (쉐어박스 기프티콘만 표시) */}
                {scope === 'SHARE_BOX' && gifticonData.shareBoxName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>쉐어박스</Text>
                    <Text style={styles.infoValue}>{gifticonData.shareBoxName}</Text>
                  </View>
                )}

                {/* 사용완료된 경우 사용일시 표시 */}
                {isUsed && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>사용일시</Text>
                    <Text style={styles.infoValue}>{formatDateTime(gifticonData.usedAt)}</Text>
                  </View>
                )}

                {/* 사용완료된 경우 사용자 정보 표시 추가 */}
                {isUsed && gifticonData.usedBy && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>사용자</Text>
                    <Text style={styles.infoValue}>{gifticonData.usedBy}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 버튼 영역 - 사용완료가 아닌 경우에만 표시 */}
          {!isUsed && (
            <View style={styles.buttonContainer}>
              {/* 사용하기/사용완료 버튼 */}
              {isUsing ? (
                // 사용 모드일 때 - 사용완료 버튼 + 취소 버튼
                <>
                  <TouchableOpacity
                    onPress={handleUse}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: 56,
                      backgroundColor: '#56AEE9',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginBottom: 10,
                    }}
                  >
                    <Text variant="body1" weight="semibold" style={{ color: '#FFFFFF' }}>
                      사용완료
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: 56,
                      backgroundColor: '#E5F4FE',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Text variant="body1" weight="semibold" style={{ color: '#278CCC' }}>
                      취소
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // 일반 모드일 때
                <TouchableOpacity
                  onPress={handleUse}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    height: 56,
                    backgroundColor: '#56AEE9',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <Text variant="body1" weight="semibold" style={{ color: '#FFFFFF' }}>
                    {calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨'
                      ? '사용완료'
                      : '사용하기'}
                  </Text>
                </TouchableOpacity>
              )}

              {!isUsing &&
                scope === 'MY_BOX' &&
                calculateDaysLeft(gifticonData.gifticonExpiryDate) !== '만료됨' && (
                  // 마이박스이고 만료되지 않은 경우에만 공유하기, 선물하기 버튼 표시
                  <View style={[styles.buttonRow, { marginTop: 10 }]}>
                    <TouchableOpacity
                      onPress={handleShare}
                      style={{
                        flex: 1,
                        marginRight: 4,
                        borderRadius: 8,
                        height: 56,
                        backgroundColor: '#EEEEEE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Icon name="inventory-2" type="material" size={22} color="#000000" />
                      <Text
                        variant="body1"
                        weight="semibold"
                        style={{ marginLeft: 8, color: '#000000' }}
                      >
                        공유하기
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleGift}
                      style={{
                        flex: 1,
                        marginLeft: 4,
                        borderRadius: 8,
                        height: 56,
                        backgroundColor: '#EEEEEE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Icon name="card-giftcard" type="material" size={22} color="#000000" />
                      <Text
                        variant="body1"
                        weight="semibold"
                        style={{ marginLeft: 8, color: '#000000' }}
                      >
                        선물하기
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          )}
        </View>
      </ScrollView>
      {/* 공유 모달 */}
      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseShareModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.boxModalContent]}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              기프티콘 정보 선택
            </Text>

            <Text variant="h5" weight="bold" style={[styles.modalSubtitle, styles.sectionTitle]}>
              등록 위치
            </Text>

            <Text variant="h5" weight="bold" style={styles.modalSubtitle}>
              공유 위치
            </Text>

            {/* 쉐어박스 선택 */}
            <View style={styles.boxSection}>
              {shareBoxes.map(box => (
                <View key={box.id} style={styles.boxRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxContainer,
                      shareBoxType === 'SHARE_BOX' &&
                        selectedShareBoxId === box.id &&
                        styles.checkboxContainerSelected,
                    ]}
                    onPress={() => {
                      setShareBoxType('SHARE_BOX');
                      setSelectedShareBoxId(box.id);
                    }}
                  >
                    <View style={styles.checkbox}>
                      {shareBoxType === 'SHARE_BOX' && selectedShareBoxId === box.id && (
                        <Icon name="check" type="material" size={16} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{box.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.boxButtonContainer}>
              <TouchableOpacity style={styles.cancelShareButton} onPress={handleCloseShareModal}>
                <Text variant="body1" weight="semibold" style={styles.cancelShareButtonText}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmShareButton} onPress={handleShareConfirm}>
                <Text variant="body1" weight="semibold" style={styles.confirmShareButtonText}>
                  공유
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 알림 다이얼로그 */}
      <AlertDialog
        isVisible={alertVisible}
        onBackdropPress={handleCancelDialog}
        title={alertType === 'delete' ? '기프티콘 삭제' : '공유 취소'}
        message={
          alertType === 'delete'
            ? '이 기프티콘을 삭제하시겠습니까?'
            : '이 기프티콘의 공유를 취소하시겠습니까?'
        }
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleCancelDialog}
        type="warning"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButtonContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    marginTop: 5,
    marginBottom: 2,
  },
  gifticonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F4FB',
  },
  imageContainer: {
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    position: 'relative',
  },
  gifticonImage: {
    width: 200,
    height: 200,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  // 바코드 관련 스타일
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  barcodeImage: {
    width: '90%',
    height: '80%',
  },
  barcodeNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  barcodeNumberText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  magnifyButton: {
    marginLeft: 12,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
  },
  brandText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    color: '#737373',
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  grayScaleImage: {
    opacity: 0.7,
    // React Native는 기본적으로 grayscale 필터를 지원하지 않기 때문에
    // 투명도를 낮춰 흑백처럼 보이게 합니다.
    // 실제 앱에서는 이미지 처리 라이브러리 사용을 고려할 수 있습니다.
  },
  smallerGifticonImage: {
    width: 160,
    height: 160,
    aspectRatio: 1,
    marginTop: 10,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  usedBarcodeContainer: {
    alignItems: 'center',
    width: '90%',
    marginTop: 5, // 바코드 상단 여백 추가
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  usedBarcodeImage: {
    width: '100%',
    height: 60,
  },
  usedBarcodeNumberText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 5,
  },
  usedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
  },
  usedText: {
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  ddayButtonContainer: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(252, 217, 217, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 5,
  },
  ddayButtonText: {
    color: '#D33434',
    fontSize: 18,
  },
  expiredButtonContainer: {
    backgroundColor: 'rgba(153, 153, 153, 0.8)',
  },
  expiredButtonText: {
    color: '#737373',
  },
  urgentDDayContainer: {
    backgroundColor: 'rgba(234, 84, 85, 0.2)',
  },
  normalDDayContainer: {
    backgroundColor: 'rgba(114, 191, 255, 0.2)',
  },
  urgentDDayText: {
    color: '#EA5455',
  },
  normalDDayText: {
    color: '#72BFFF',
  },
  // 액션 아이콘 컨테이너 스타일
  actionIconsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    maxHeight: '70%',
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
  boxSection: {
    marginBottom: 20,
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
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  boxButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelShareButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    marginRight: 8,
  },
  confirmShareButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelShareButtonText: {
    color: '#333333',
  },
  confirmShareButtonText: {
    color: '#FFFFFF',
  },
});

export default BoxDetailProductScreen;
