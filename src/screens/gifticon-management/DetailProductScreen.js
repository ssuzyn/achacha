// 상세 스크린 - 상품형

import React from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

const DetailProductScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // 더미 기프티콘 데이터
  const gifticonData = {
    id: '1',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    expiryDate: '2025.04.28',
    daysLeft: 7,
    imageUrl: require('../../assets/images/dummy-starbucks.png'),
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
    // 사용 로직 구현
    console.log('기프티콘 사용하기');
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 로직 구현
    console.log('기프티콘 선물하기');
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
              <View style={styles.imageContainer}>
                <Image
                  source={gifticonData.imageUrl}
                  style={styles.gifticonImage}
                  resizeMode="contain"
                />
              </View>

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

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <Button
              title="사용하기"
              onPress={handleUse}
              style={styles.useButton}
              variant="primary"
              size="lg"
            />

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
});

export default DetailProductScreen;
