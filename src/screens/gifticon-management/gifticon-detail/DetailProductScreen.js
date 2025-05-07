// 상세 스크린 - 상품형

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useTabBar } from '../../../context/TabBarContext';
import NavigationService from '../../../navigation/NavigationService';

const DetailProductScreen = () => {
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
  // 기프티콘 데이터 상태
  const [gifticonData, setGifticonData] = useState(null);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);

  // 바텀탭 표시 - 화면이 포커스될 때마다 표시 보장
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();
    });

    // 초기 로드 시에도 바텀탭 표시
    showTabBar();

    return unsubscribe;
  }, [navigation, showTabBar]);

  // route.params에서 scope와 gifticonId, usageType, usedAt을 가져오는 부분
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
      // 실제 구현에서는 API 호출로 대체
      // const response = await api.getGifticonDetail(id);
      // setGifticonData(response.data);

      // 더미 데이터 - API 명세에 맞춤 (테스트용)
      // 실제 구현에서는 삭제하고 API 호출로 대체
      setTimeout(() => {
        let dummyData;

        if (scope === 'USED') {
          // 사용완료된 기프티콘 더미 데이터
          dummyData = {
            gifticonId: id,
            gifticonName: '아이스 카페 아메리카노 T',
            gifticonType: 'PRODUCT',
            gifticonExpiryDate: '2025-12-31',
            brandId: 45,
            brandName: '스타벅스',
            scope: scope,
            usageType: usageType || 'SELF_USE', // 사용유형
            usageHistoryCreatedAt: usedAt || '2025-01-15T14:30:00', // 사용일시
            thumbnailPath: require('../../../assets/images/dummy-starbucks.png'),
            originalImagePath:
              usageType === 'SELF_USE'
                ? require('../../../assets/images/dummy-starbucks.png')
                : null,
            gifticonCreatedAt: '2025-01-01T10:30:00',
          };
        } else {
          // 일반 기프티콘 더미 데이터
          dummyData = {
            gifticonId: id,
            gifticonName: '아이스 카페 아메리카노 T',
            gifticonType: 'PRODUCT',
            gifticonExpiryDate: '2025-05-10',
            brandId: 45,
            brandName: '스타벅스',
            scope: scope, // 파라미터에서 받은 scope 사용
            userId: 78,
            userName: '홍길동',
            shareBoxId: scope === 'SHARE_BOX' ? 90 : null,
            shareBoxName: scope === 'SHARE_BOX' ? '스터디 그룹' : null,
            thumbnailPath: require('../../../assets/images/dummy-starbucks.png'),
            originalImagePath: require('../../../assets/images/dummy-starbucks.png'),
            gifticonCreatedAt: '2025-01-15T10:30:00',
            barcodeNumber: '8013-7621-1234-5678', // 바코드 번호 (더미)
            barcodeImageUrl: require('../../../assets/images/barcode.png'), // 바코드 이미지 (더미)
          };
        }
        setGifticonData(dummyData);
        setIsLoading(false);
      }, 500); // 0.5초 지연 (로딩 효과)
    } catch (error) {
      // console.error('기프티콘 데이터 로드 실패:', error);
      setIsLoading(false);
      // 에러 처리 로직 추가 (예: 에러 상태 설정, 토스트 메시지 등)
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

  // 공유하기 기능
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${gifticonData.brandName} ${gifticonData.gifticonName} 기프티콘을 공유합니다.`,
      });
    } catch (error) {
      // console.error(error);
      // 오류 처리
    }
  };

  // 사용하기 기능
  const handleUse = () => {
    if (!isUsing) {
      // 사용 모드로 전환
      setIsUsing(true);
    } else {
      // 이미 사용 중인 경우 사용 완료 처리
      // console.log('기프티콘 사용 완료');

      // API 호출로 기프티콘 상태를 사용완료로 변경 (실제 구현 시 주석 해제)
      // 예: await api.updateGifticonStatus(gifticonId, 'USED');

      // ManageListScreen으로 이동하면서 네비게이션 스택 초기화
      // 사용완료 탭으로 바로 이동하기 위한 파라미터 전달
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: { screen: 'TabGifticonManage', initialTab: 'used' },
          },
        ],
      });
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

  // 로딩 중이거나 데이터가 없는 경우 로딩 화면 표시
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
        return '나눔완료';
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

                  {/* SELF_USE 유형의 사용완료 기프티콘인 경우 바코드 표시 */}
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

                {/* 사용완료된 경우 사용일시 표시 */}
                {isUsed && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>사용일시</Text>
                    <Text style={styles.infoValue}>
                      {formatDateTime(gifticonData.usageHistoryCreatedAt)}
                    </Text>
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
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
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
              )}

              {!isUsing && scope === 'MY_BOX' && (
                // 마이박스일 때만 공유하기, 선물하기 버튼 표시
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
            </View>
          )}
        </View>
      </ScrollView>
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
    padding: 16,
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    position: 'relative',
  },
  gifticonImage: {
    width: '60%',
    height: '90%',
    marginTop: 5,
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
  buttonContainer: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyButton: {
    flex: 1,
    marginLeft: 4,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#56AEE9',
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
    height: '55%', // 기존 높이보다 살짝 줄임
    marginTop: 25, // 상단 여백 추가
    marginBottom: 8, // 하단 여백 조정
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
});

export default DetailProductScreen;
