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

const DetailProductScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  // 마이박스 또는 쉐어박스 구분 (route.params에서 받아오도록 수정)
  const [boxType, setBoxType] = useState('mybox'); // 'mybox' 또는 'sharebox'

  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);

  // route.params에서 boxType을 가져오는 부분
  useEffect(() => {
    if (route.params?.boxType) {
      setBoxType(route.params.boxType);
    }
  }, [route.params]);

  // 더미 기프티콘 데이터
  const gifticonData = {
    id: '1',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    expiryDate: '2025.04.28',
    daysLeft: 7,
    source: '정주은', // 쉐어박스일 때 출처 정보
    barcodeNumber: '23424-325235-2352525-45345', // 바코드 번호
    imageUrl: require('../../assets/images/dummy-starbucks.png'),
    barcodeImageUrl: require('../../assets/images/barcode.png'), // 바코드 이미지 (더미)
  };

  // 공유하기 기능
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${gifticonData.brand} ${gifticonData.name} 기프티콘을 공유합니다.`,
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
      // 여기에 사용 완료 로직 추가 (API 호출 등)
    }
  };

  // 돋보기 기능 - 확대 화면으로 이동
  const handleMagnify = () => {
    navigation.navigate('UseProductScreen', {
      id: gifticonData.id,
      barcodeNumber: gifticonData.barcodeNumber,
    });
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 로직 구현
    console.log('기프티콘 선물하기');
  };

  // 테스트용 박스 타입 전환 함수
  const toggleBoxType = () => {
    setBoxType(boxType === 'mybox' ? 'sharebox' : 'mybox');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 상세
        </Text>
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
                    source={gifticonData.imageUrl}
                    style={styles.gifticonImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{gifticonData.brand}</Text>
                <Text style={styles.nameText}>{gifticonData.name}</Text>

                <View style={styles.expiryContainer}>
                  <Text style={styles.expiryLabel}>~ {gifticonData.expiryDate}</Text>
                  <Text style={styles.expiryDday}>D-{gifticonData.daysLeft}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 버튼 영역 - 박스 타입에 따라 다른 UI 표시 */}
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
              (boxType === 'mybox' ? (
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
                    <Icon name="person" type="material" size={24} color="#4A90E2" />
                    <Text style={styles.sourceText}>오라차차 대성이네</Text>
                  </View>
                </View>
              ))}

            {/* 테스트용 타입 전환 버튼 (실제 앱에서는 삭제) */}
            {!isUsing && (
              <TouchableOpacity style={styles.typeToggleButton} onPress={toggleBoxType}>
                <Text style={styles.typeToggleText}>
                  현재: {boxType === 'mybox' ? '마이박스' : '쉐어박스'} (탭하여 전환)
                </Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    textAlign: 'center',
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
    width: '80%',
    height: '70%',
  },
  barcodeNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  barcodeNumberText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  magnifyButton: {
    marginLeft: 12,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  expiryLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  expiryDday: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5DADE2',
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
  typeToggleButton: {
    marginTop: 20,
    padding: 8,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeToggleText: {
    fontSize: 14,
    color: '#888',
  },
});

export default DetailProductScreen;
