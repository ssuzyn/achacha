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
import { Text, Button } from '../../../components/ui';
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
  const [scope, setScope] = useState('MY_BOX'); // 'MY_BOX' 또는 'SHARE_BOX'
  // 기프티콘 ID 관리
  const [gifticonId, setGifticonId] = useState(null);
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

  // route.params에서 scope와 gifticonId를 가져오는 부분
  useEffect(() => {
    if (route.params) {
      if (route.params.scope) {
        setScope(route.params.scope);
      }
      if (route.params.gifticonId) {
        setGifticonId(route.params.gifticonId);
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
        const dummyData = {
          gifticonId: id,
          gifticonName: '아메리카노',
          gifticonType: 'PRODUCT',
          gifticonExpiryDate: '2025-12-31',
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
        setGifticonData(dummyData);
        setIsLoading(false);
      }, 500); // 0.5초 지연 (로딩 효과)
    } catch (error) {
      console.error('기프티콘 데이터 로드 실패:', error);
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
    return diffDays > 0 ? diffDays : 0;
  };

  // 공유하기 기능
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${gifticonData.brandName} ${gifticonData.gifticonName} 기프티콘을 공유합니다.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 사용하기 기능
  const handleUse = () => {
    if (!isUsing) {
      // 사용 모드로 전환
      setIsUsing(true);
    } else {
      // 이미 사용 중인 경우 사용 완료 처리
      console.log('기프티콘 사용 완료');

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
    console.log('기프티콘 선물하기');
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                // 일반 모드일 때 기프티콘 이미지 표시
                <View style={styles.imageContainer}>
                  <Image
                    source={gifticonData.thumbnailPath}
                    style={styles.gifticonImage}
                    resizeMode="contain"
                  />
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
                  <Text style={styles.expiryDday}>
                    D-{calculateDaysLeft(gifticonData.gifticonExpiryDate)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>등록일</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(gifticonData.gifticonCreatedAt)}
                  </Text>
                </View>

                {/* 마이박스가 아닌 경우에만 등록자 정보 표시 */}
                {scope !== 'MY_BOX' && (
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
              </View>
            </View>
          </View>

          {/* 버튼 영역 - scope에 따라 다른 UI 표시 */}
          <View style={styles.buttonContainer}>
            {/* 사용하기/사용완료 버튼 */}
            <Button
              title={isUsing ? '사용완료' : '사용하기'}
              onPress={handleUse}
              style={[styles.useButton, isUsing && styles.useCompleteButton]}
              variant={isUsing ? 'outline' : 'primary'}
              size="lg"
            />

            {!isUsing &&
              // 사용 모드가 아닐 때만 추가 버튼 표시
              (scope === 'MY_BOX' ? (
                // 마이박스일 때 - 공유하기, 선물하기 버튼
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Icon name="share" type="material" size={24} color="#666" />
                    <Text style={styles.actionButtonText}>공유하기</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={handleGift}>
                    <Icon name="card-giftcard" type="material" size={24} color="#666" />
                    <Text style={styles.actionButtonText}>선물하기</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // 쉐어박스일 때 - 출처 정보 표시
                <View style={styles.sourceContainer}>
                  <View style={styles.sourceButton}>
                    <Icon name="inventory-2" type="material" size={24} color="#4A90E2" />
                    <Text style={styles.sourceText}>{gifticonData.shareBoxName}</Text>
                  </View>
                </View>
              ))}
          </View>
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
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  gifticonCard: {
    backgroundColor: '#F5FCFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F4FB',
  },
  imageContainer: {
    backgroundColor: '#D2F2FF',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 350,
  },
  gifticonImage: {
    width: '60%',
    height: '90%',
  },
  // 바코드 관련 스타일
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 350,
  },
  barcodeImage: {
    width: '90%',
    height: '80%',
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
    marginBottom: 12,
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
  expiryDday: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5DADE2',
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  useButton: {
    borderRadius: 8,
    marginBottom: 12,
  },
  useCompleteButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
  },
  sourceContainer: {
    marginTop: 10,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sourceText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
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
});

export default DetailProductScreen;
