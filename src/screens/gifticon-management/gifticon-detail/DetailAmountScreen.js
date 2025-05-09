/* eslint-disable react-native/no-inline-styles */
// 상세 스크린 - 금액형

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useTabBar } from '../../../context/TabBarContext';
import NavigationService from '../../../navigation/NavigationService';
import AlertDialog from '../../../components/ui/AlertDialog';

const DetailAmountScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { showTabBar } = useTabBar();

  // scope 상태 관리
  const [scope, setScope] = useState('MY_BOX'); // 'MY_BOX', 'SHARE_BOX' 또는 'USED'
  // 기프티콘 ID 관리
  const [gifticonId, setGifticonId] = useState(null);
  // 사용 유형 관리 (사용완료 경우에만)
  const [usageType, setUsageType] = useState(null);
  // 사용일시 관리 (사용완료 경우에만)
  const [usedAt, setUsedAt] = useState(null);
  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 기프티콘 데이터 상태
  const [gifticonData, setGifticonData] = useState(null);
  // 금액 입력 모달 표시 상태
  const [modalVisible, setModalVisible] = useState(false);
  // 입력된 금액 상태
  const [amount, setAmount] = useState('');
  // AlertDialog 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('delete'); // 'delete' 또는 'cancelShare'
  // 공유자인지 확인 (공유박스에서 내가 공유한 것인지)
  const [isSharer, setIsSharer] = useState(false);
  // 공유 모달 상태 관리
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  // 공유 위치 선택 상태
  const [shareBoxType, setShareBoxType] = useState('SHARE_BOX');
  const [selectedShareBoxId, setSelectedShareBoxId] = useState(null);

  // 바텀탭 표시 - 화면이 포커스될 때마다 표시 보장
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();
    });

    // 초기 로드 시에도 바텀탭 표시
    showTabBar();

    return unsubscribe;
  }, [navigation, showTabBar]);

  // route.params에서 scope, gifticonId, usageType, usedAt을 가져오는 부분
  useEffect(() => {
    if (route.params) {
      if (route.params.scope) {
        setScope(route.params.scope);
      }
      if (route.params.gifticonId) {
        setGifticonId(route.params.gifticonId);
      }
      if (route.params.usageType) {
        setUsageType(route.params.usageType);
      }
      if (route.params.usedAt) {
        setUsedAt(route.params.usedAt);
      }
      // 공유박스에서 내가 공유한 것인지 확인
      if (route.params.isSharer) {
        setIsSharer(route.params.isSharer);
      }
      // refresh 플래그가 true이면 데이터 다시 로드
      if (route.params.refresh && gifticonId) {
        loadGifticonData(gifticonId);
        // 사용하기 모드 종료
        setIsUsing(false);
      }
    }
  }, [route.params, gifticonId]);

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
      // 실제 구현에서는 API 호출로 대체
      // const response = await api.getGifticonDetail(id);
      // setGifticonData(response.data);

      // 더미 데이터 예시 (테스트용)
      setTimeout(() => {
        let dummyData;

        if (scope === 'USED') {
          // 사용완료된 기프티콘 더미 데이터
          dummyData = {
            gifticonId: id,
            gifticonName: 'APP전용 e카드 3만원 교환권',
            gifticonType: 'AMOUNT',
            gifticonExpiryDate: '2025-03-31',
            brandId: 46,
            brandName: '스타벅스',
            scope: scope,
            usageType: usageType || 'SELF_USE', // 사용유형
            usageHistoryCreatedAt: usedAt || '2025-01-25T16:45:00', // 사용일시
            thumbnailPath: require('../../../assets/images/dummy-starbuckscard.png'),
            originalImagePath:
              usageType === 'SELF_USE'
                ? require('../../../assets/images/dummy-starbuckscard.png')
                : null,
            gifticonCreatedAt: '2024-12-20T11:30:00',
            gifticonOriginalAmount: 10000,
            // 더미 데이터에 공유자 ID 추가
            userId: 78, // 사용자 ID
            isSharer: route.params?.isSharer || false, // 공유자 여부
            // 사용 내역 추가
            transactions: [
              {
                id: '1',
                date: '2025-01-10',
                time: '14:30',
                userName: '홍길동',
                amount: 3000,
                type: 'payment',
                timestamp: new Date('2025-01-10T14:30:00').getTime(),
              },
              {
                id: '2',
                date: '2025-01-20',
                time: '16:45',
                userName: '김철수',
                amount: 5000,
                type: 'payment',
                timestamp: new Date('2025-01-20T16:45:00').getTime(),
              },
              {
                id: '3',
                date: '2025-01-25',
                time: '10:15',
                userName: '박지민',
                amount: 2000,
                type: 'payment',
                timestamp: new Date('2025-01-25T10:15:00').getTime(),
              },
            ].sort((a, b) => b.timestamp - a.timestamp), // 날짜 내림차순 정렬 (최신순)
          };
        } else {
          // 일반 기프티콘 더미 데이터
          dummyData = {
            gifticonId: id || 124,
            gifticonName: 'APP전용 e카드 3만원 교환권',
            gifticonType: 'AMOUNT',
            gifticonExpiryDate: '2025-06-15',
            brandId: 46,
            brandName: '스타벅스',
            scope: scope,
            userId: 78,
            userName: '홍길동',
            shareBoxId: scope === 'SHARE_BOX' ? 90 : null,
            shareBoxName: scope === 'SHARE_BOX' ? '스터디 그룹' : null,
            thumbnailPath: require('../../../assets/images/dummy-starbuckscard.png'),
            originalImagePath: require('../../../assets/images/dummy-starbuckscard.png'),
            gifticonCreatedAt: '2025-01-15T10:30:00',
            gifticonOriginalAmount: 30000,
            gifticonRemainingAmount: 8000,
            barcodeNumber: '8013-7621-1234-5678', // 바코드 번호 (더미)
            barcodeImageUrl: require('../../../assets/images/barcode.png'), // 바코드 이미지 (더미)
            // 더미 데이터에 공유자 ID 추가
            isSharer: route.params?.isSharer || false, // 공유자 여부
          };
        }

        setGifticonData(dummyData);
        setIsSharer(dummyData.isSharer);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      // console.error('기프티콘 데이터 로드 실패:', error);
      setIsLoading(false);
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

  // D-day 계산 함수
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return '만료됨';
    }
    return diffDays;
  };

  // 금액 포맷 함수
  const formatAmount = amount => {
    return amount.toLocaleString() + '원';
  };

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 더미 데이터: 쉐어박스 목록
  const shareBoxes = [
    { id: 1, name: '으라차차 해인네' },
    { id: 2, name: '으라차차 주은이네' },
    { id: 3, name: '으라차차 대성이네' },
  ];

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
  const handleShareConfirm = () => {
    // 공유 위치 선택 확인
    if (shareBoxType === 'SHARE_BOX' && !selectedShareBoxId) {
      Alert.alert('알림', '공유할 쉐어박스를 선택해주세요.');
      return;
    }

    // 공유 API 호출 또는 처리 로직
    // console.log('기프티콘 공유:', gifticonId, '위치:', shareBoxType, '쉐어박스:', getShareBoxName(selectedShareBoxId));

    // 성공 메시지
    Alert.alert('성공', '기프티콘이 성공적으로 공유되었습니다.', [
      {
        text: '확인',
        onPress: () => {
          // 모달 닫기
          setShareModalVisible(false);
          // 추가 로직이 필요하면 여기에 구현
        },
      },
    ]);
  };

  // 공유 모달 닫기
  const handleCloseShareModal = () => {
    setShareModalVisible(false);
  };

  // 사용하기 버튼 클릭
  const handleUse = () => {
    // 사용 모드로 전환
    setIsUsing(true);
  };

  // 금액 입력 모달 표시
  const handleAmountInput = () => {
    setModalVisible(true);
  };

  // 금액 입력 완료 처리
  const handleConfirmAmount = () => {
    // 금액 입력 값 검증
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      // 실제 구현에서는 오류 메시지 표시
      // console.log('유효한 금액을 입력해주세요');
      return;
    }

    // 입력한 금액이 잔액보다 크면 오류
    if (Number(amount) > gifticonData.gifticonRemainingAmount) {
      // 실제 구현에서는 오류 메시지 표시
      // console.log('잔액보다 큰 금액을 사용할 수 없습니다');
      return;
    }

    // console.log(`사용 금액: ${amount}원 사용 완료`);

    // API 호출로 기프티콘 사용 처리 (실제 구현 시 주석 해제)
    // 예: await api.useGifticon(gifticonId, amount);

    // 모달 닫기
    setModalVisible(false);
    setAmount('');

    // 사용 모드 종료
    setIsUsing(false);

    // 사용내역 화면으로 이동
    navigation.navigate('DetailAmountHistoryScreen', {
      id: gifticonId,
      usedAmount: amount,
      isFromDetailScreen: true,
    });
  };

  // 모달 취소
  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount('');
  };

  // 금액 칩 선택 처리
  const handleChipSelect = value => {
    if (value === 'all') {
      // '전액' 선택 시 남은 잔액 전체 설정
      setAmount(gifticonData.gifticonRemainingAmount.toString());
    } else {
      // 기존 금액에 선택한 금액 추가
      const currentAmount = Number(amount) || 0;
      const newAmount = currentAmount + value;

      // 잔액보다 크면 잔액으로 제한
      if (newAmount > gifticonData.gifticonRemainingAmount) {
        setAmount(gifticonData.gifticonRemainingAmount.toString());
      } else {
        setAmount(newAmount.toString());
      }
    }
  };

  // 사용 취소 기능
  const handleCancel = () => {
    setIsUsing(false);
  };

  // 돋보기 기능 - 확대 화면으로 이동
  const handleMagnify = () => {
    navigation.navigate('UseAmountScreen', {
      id: gifticonData.gifticonId,
      barcodeNumber: gifticonData.barcodeNumber,
    });
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 화면으로 이동
    navigation.navigate('PresentScreen', {
      gifticonId: gifticonData.gifticonId,
    });
  };

  // 사용내역 기능
  const handleHistory = () => {
    // 사용내역 조회 로직
    // console.log('사용내역 조회');
    navigation.navigate('DetailAmountHistoryScreen', { id: gifticonData.gifticonId });
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
  const handleConfirm = () => {
    setAlertVisible(false);

    if (alertType === 'delete') {
      // 삭제 처리 로직
      // 실제 구현에서는 API 호출로 기프티콘 삭제
      // console.log('기프티콘 삭제:', gifticonId);

      // 리스트 화면으로 이동
      navigation.goBack();
    } else if (alertType === 'cancelShare') {
      // 공유 취소 처리 로직
      // 실제 구현에서는 API 호출로 공유 취소
      // console.log('공유 취소:', gifticonId);

      // 리스트 화면으로 이동
      navigation.goBack();
    }
  };

  // 다이얼로그 취소 버튼 처리
  const handleCancelDialog = () => {
    setAlertVisible(false);
  };

  // 로딩 중이거나 데이터가 없는 경우 로딩 화면 표시
  if (isLoading || !gifticonData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                    source={gifticonData.barcodeImageUrl}
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
                    source={gifticonData.thumbnailPath}
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
                      {scope === 'SHARE_BOX' && isSharer && (
                        <TouchableOpacity
                          style={styles.actionIconButton}
                          onPress={handleCancelShare}
                        >
                          <Icon name="person-remove" type="material" size={24} color="#718096" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* SELF_USE 유형의 사용완료 기프티콘인 경우만 바코드 표시 */}
                  {isUsed && gifticonData.usageType === 'SELF_USE' && (
                    <View style={styles.usedBarcodeContainer}>
                      <Image
                        source={
                          gifticonData.barcodeImageUrl ||
                          require('../../../assets/images/barcode.png')
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
                        typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string'
                          ? styles.expiredButtonContainer
                          : calculateDaysLeft(gifticonData.gifticonExpiryDate) <= 7
                            ? styles.urgentDDayContainer
                            : styles.normalDDayContainer,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ddayButtonText,
                          typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string'
                            ? styles.expiredButtonText
                            : calculateDaysLeft(gifticonData.gifticonExpiryDate) <= 7
                              ? styles.urgentDDayText
                              : styles.normalDDayText,
                        ]}
                      >
                        {typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string'
                          ? calculateDaysLeft(gifticonData.gifticonExpiryDate)
                          : `D-${calculateDaysLeft(gifticonData.gifticonExpiryDate)}`}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{gifticonData.brandName}</Text>
                <Text style={styles.nameText}>{gifticonData.gifticonName}</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>유효기간</Text>
                  <Text style={styles.infoValue}>
                    ~ {formatDate(gifticonData.gifticonExpiryDate)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>등록일</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(gifticonData.gifticonCreatedAt)}
                  </Text>
                </View>

                {/* 마이박스가 아닌 경우에만 등록자 정보 표시 */}
                {scope !== 'MY_BOX' && scope !== 'USED' && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>등록자</Text>
                    <Text style={styles.infoValue}>{gifticonData.userName}</Text>
                  </View>
                )}

                {scope === 'SHARE_BOX' && gifticonData.shareBoxName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>쉐어박스</Text>
                    <Text style={styles.infoValue}>{gifticonData.shareBoxName}</Text>
                  </View>
                )}

                {/* 사용완료된 경우 사용일시 표시 및 사용내역 표시 */}
                {isUsed && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>사용일시</Text>
                      <Text style={styles.infoValue}>
                        {formatDateTime(gifticonData.usageHistoryCreatedAt)}
                      </Text>
                    </View>

                    {/* 사용자 정보 표시 추가
                    {gifticonData.usedBy && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>사용자</Text>
                        <Text style={styles.infoValue}>{gifticonData.usedBy}</Text>
                      </View>
                    )} */}
                  </>
                )}

                <View style={styles.divider} />

                <View style={styles.amountInfoRow}>
                  <Text style={styles.amountLabel}>총 금액</Text>
                  <View style={styles.amountValueContainer}>
                    <Text style={styles.amountValue}>
                      {formatAmount(gifticonData.gifticonOriginalAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountInfoRow}>
                  <Text style={styles.amountLabel}>잔액</Text>
                  <View style={styles.amountValueContainer}>
                    <Text style={[styles.amountValue, !isUsed && styles.remainingAmount]}>
                      {formatAmount(isUsed ? 0 : gifticonData.gifticonRemainingAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 버튼 영역 - 사용완료가 아닌 경우에만 표시 */}
          {!isUsed && (
            <View style={styles.buttonContainer}>
              {/* 버튼 영역 - 사용 상태에 따라 다른 UI */}
              {isUsing ? (
                // 사용 모드일 때 - 금액입력/취소 버튼을 두 줄로 표시
                <>
                  <TouchableOpacity
                    onPress={handleAmountInput}
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
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      금액입력
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
                    <Text
                      style={{
                        color: '#278CCC',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      취소
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // 일반 모드일 때 - 상단 버튼 영역 (사용하기/사용내역)
                <>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={handleUse}
                      style={{
                        flex: 1,
                        marginRight: 4,
                        borderRadius: 8,
                        height: 56,
                        backgroundColor: '#56AEE9',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}
                      >
                        사용하기
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleHistory}
                      style={{
                        flex: 1,
                        marginLeft: 4,
                        borderRadius: 8,
                        height: 56,
                        backgroundColor: '#E5F4FE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        style={{
                          color: '#278CCC',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}
                      >
                        사용내역
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {scope === 'MY_BOX' && (
                    // 마이박스일 때만 공유하기/선물하기 버튼 표시
                    <View style={styles.buttonRow}>
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
                          style={{
                            marginLeft: 8,
                            color: '#000000',
                            fontSize: 16,
                            fontWeight: 'semibold',
                          }}
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
                          style={{
                            marginLeft: 8,
                            color: '#000000',
                            fontSize: 16,
                            fontWeight: 'semibold',
                          }}
                        >
                          선물하기
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* 사용내역 섹션 - 사용완료된 경우에만 표시 */}
          {isUsed && gifticonData.transactions && gifticonData.transactions.length > 0 && (
            <View style={styles.transactionSection}>
              <Text style={styles.transactionTitle}>사용 내역</Text>

              <View style={styles.transactionsContainer}>
                {gifticonData.transactions.map(transaction => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionUser}>{transaction.userName}</Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.date)} {transaction.time}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text
                        style={[
                          styles.amountText,
                          { color: transaction.type === 'charge' ? '#1E88E5' : '#56AEE9' },
                        ]}
                      >
                        {transaction.type === 'charge' ? '' : '-'}
                        {formatNumber(transaction.amount)}원
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 하단 여백 추가 */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* 금액 입력 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>사용 금액 입력</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                maxLength={10}
              />
              <Text style={styles.wonText}>원</Text>
            </View>

            <View style={styles.chipsContainer}>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect(500)}>
                <Text style={styles.chipText}>+500</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect(1000)}>
                <Text style={styles.chipText}>+1,000</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect(5000)}>
                <Text style={styles.chipText}>+5,000</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect('all')}>
                <Text style={styles.chipText}>전액</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.remainingAmountText}>
              잔액: {formatAmount(gifticonData?.gifticonRemainingAmount || 0)}
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmAmount}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
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

      {/* 공유 모달 */}
      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseShareModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.shareModalContent, styles.boxModalContent]}>
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
                <Text variant="body1" weight="bold" style={styles.cancelShareButtonText}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmShareButton} onPress={handleShareConfirm}>
                <Text variant="body1" weight="bold" style={styles.confirmShareButtonText}>
                  공유
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    marginTop: 10,
    marginBottom: 3,
  },
  gifticonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F4FB',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    height: 300,
    backgroundColor: '#EEEEEE',
    position: 'relative',
    paddingBottom: 10,
  },
  gifticonImage: {
    width: '60%',
    height: '90%',
    borderRadius: 8,
  },
  infoContainer: {
    padding: 16,
  },
  brandText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  amountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  amountLabel: {
    width: 80,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  amountValueContainer: {
    flex: 1,
  },
  amountValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  remainingAmount: {
    color: '#278CCC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  useButton: {
    flex: 1,
    marginRight: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#56AEE9',
  },
  useCompleteButton: {
    borderWidth: 1,
    width: '100%',
    height: 56,
  },
  historyButton: {
    flex: 1,
    marginLeft: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#E5F4FE',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#A7DAF9',
    borderWidth: 0,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  grayScaleImage: {
    opacity: 0.7,
    // React Native는 기본적으로 grayscale 필터를 지원하지 않기 때문에
    // 투명도를 낮춰 흑백처럼 보이게 합니다.
  },
  smallerGifticonImage: {
    height: '50%',
    marginBottom: 5,
    marginTop: 20,
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
    fontWeight: 'bold',
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
    fontWeight: 'semibold',
  },
  expiredButtonContainer: {
    backgroundColor: 'rgba(153, 153, 153, 0.8)',
  },
  expiredButtonText: {
    color: '#FFFFFF',
  },
  urgentDDayContainer: {
    backgroundColor: 'rgba(234, 84, 85, 0.2)',
  },
  normalDDayContainer: {
    backgroundColor: 'rgba(114, 191, 255, 0.2)',
  },
  urgentDDayText: {
    color: '#EA5455',
    fontWeight: 'bold',
  },
  normalDDayText: {
    color: '#72BFFF',
    fontWeight: 'bold',
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
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 12,
  },
  transactionsContainer: {
    marginTop: 5,
  },
  transactionItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#737373',
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionSection: {
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // 사용완료된 기프티콘 바코드 스타일
  usedBarcodeContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
    padding: 20,
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
  // 사용 모드 바코드 스타일
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    height: 220,
  },
  barcodeImage: {
    width: '90%',
    height: 150,
  },
  barcodeNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
  shareButton: {
    flex: 1,
    marginRight: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#A7DAF9',
  },
  giftButton: {
    flex: 1,
    marginLeft: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#A7DAF9',
  },
  // 모달 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 10,
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 200,
    marginRight: 5,
  },
  wonText: {
    fontSize: 20,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  remainingAmountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    alignSelf: 'flex-end',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  bottomPadding: {
    height: 60,
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
  // 공유 모달 관련 스타일
  shareModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  boxModalContent: {
    maxHeight: '70%',
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

export default DetailAmountScreen;
