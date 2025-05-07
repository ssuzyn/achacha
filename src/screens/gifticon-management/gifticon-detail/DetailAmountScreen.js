// 상세 스크린 - 금액형

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

      // 더미 데이터 예시 (테스트용)
      setTimeout(() => {
        let dummyData;

        if (scope === 'USED') {
          // 사용완료된 기프티콘 더미 데이터
          dummyData = {
            gifticonId: id,
            gifticonName: '문화상품권',
            gifticonType: 'AMOUNT',
            gifticonExpiryDate: '2025-03-31',
            brandId: 46,
            brandName: '컬쳐랜드',
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
            // 사용 내역 추가
            transactions: [
              {
                id: '1',
                date: '2025-01-10',
                time: '14:30',
                userName: '홍길동',
                amount: 3000,
                type: 'payment',
              },
              {
                id: '2',
                date: '2025-01-20',
                time: '16:45',
                userName: '김철수',
                amount: 5000,
                type: 'payment',
              },
              {
                id: '3',
                date: '2025-01-25',
                time: '10:15',
                userName: '이영희',
                amount: 2000,
                type: 'payment',
              },
            ],
          };
        } else {
          // 일반 기프티콘 더미 데이터
          dummyData = {
            gifticonId: id || 124,
            gifticonName: '문화상품권',
            gifticonType: 'AMOUNT',
            gifticonExpiryDate: '2025-12-31',
            brandId: 46,
            brandName: '컬쳐랜드',
            scope: scope,
            userId: 78,
            userName: '홍길동',
            shareBoxId: scope === 'SHARE_BOX' ? 90 : null,
            shareBoxName: scope === 'SHARE_BOX' ? '스터디 그룹' : null,
            thumbnailPath: require('../../../assets/images/dummy-starbuckscard.png'),
            originalImagePath: require('../../../assets/images/dummy-starbuckscard.png'),
            gifticonCreatedAt: '2025-01-15T10:30:00',
            gifticonOriginalAmount: 10000,
            gifticonRemainingAmount: 8000,
            barcodeNumber: '8013-7621-1234-5678', // 바코드 번호 (더미)
            barcodeImageUrl: require('../../../assets/images/barcode.png'), // 바코드 이미지 (더미)
          };
        }

        setGifticonData(dummyData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('기프티콘 데이터 로드 실패:', error);
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
    return diffDays > 0 ? diffDays : 0;
  };

  // 금액 포맷 함수
  const formatAmount = amount => {
    return amount.toLocaleString() + '원';
  };

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

      // 사용완료 탭으로 이동
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
    navigation.navigate('UseAmountScreen', {
      id: gifticonData.gifticonId,
      barcodeNumber: gifticonData.barcodeNumber,
    });
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 로직 구현
    console.log('기프티콘 선물하기');
  };

  // 사용내역 기능
  const handleHistory = () => {
    // 사용내역 조회 로직
    console.log('사용내역 조회');
    navigation.navigate('DetailAmountHistoryScreen', { id: gifticonData.gifticonId });
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
                    style={[styles.gifticonImage, isUsed && styles.grayScaleImage]}
                    resizeMode="contain"
                  />
                  {isUsed && (
                    <View style={styles.usedOverlay}>
                      <Text style={styles.usedText}>{getUsageTypeText()}</Text>
                    </View>
                  )}
                  {!isUsed && (
                    <View style={styles.ddayButtonContainer}>
                      <Text style={styles.ddayButtonText}>
                        D-{calculateDaysLeft(gifticonData.gifticonExpiryDate)}
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
                // 사용 모드일 때 - 사용완료 버튼만 표시
                <Button
                  title="사용완료"
                  onPress={handleUse}
                  style={[styles.useButton, styles.useCompleteButton]}
                  variant="outline"
                />
              ) : (
                // 일반 모드일 때 - 상단 버튼 영역 (사용하기/사용내역)
                <>
                  <View style={styles.buttonRow}>
                    <Button
                      title="사용하기"
                      onPress={handleUse}
                      style={styles.useButton}
                      variant="primary"
                    />
                    <Button
                      title="사용내역"
                      onPress={handleHistory}
                      style={styles.historyButton}
                      variant="outline"
                    />
                  </View>

                  {scope === 'MY_BOX' && (
                    // 마이박스일 때만 공유하기/선물하기 버튼 표시
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
                          { color: transaction.type === 'charge' ? '#1E88E5' : '#F44336' },
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
    marginTop: 10,
    marginBottom: 20,
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
    backgroundColor: '#E5F4FE',
    position: 'relative',
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
    marginRight: 8,
    borderRadius: 8,
  },
  useCompleteButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  historyButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
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
  grayScaleImage: {
    opacity: 0.7,
    // React Native는 기본적으로 grayscale 필터를 지원하지 않기 때문에
    // 투명도를 낮춰 흑백처럼 보이게 합니다.
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
    color: '#888',
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
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
  // 바코드 관련 스타일
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
});

export default DetailAmountScreen;
