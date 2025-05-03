import React from 'react';
import { Image, StyleSheet, ScrollView, View, Text, FlatList } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Icon } from 'react-native-elements';

// 샘플 데이터 - 실제 앱에서는 API 또는 Redux 스토어에서 가져올 것입니다.
const SAMPLE_GIFTICONS = [
  {
    id: '1',
    brand: '맥도날드',
    name: '모바일 금액권 20,000원',
    image: require('../assets/images/giftscan.png'),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
  },
  {
    id: '2',
    brand: '메가MGC커피',
    name: '(자바)아이스라떼',
    image: require('../assets/images/giftbox1.png'),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
  },
  {
    id: '3',
    brand: '스타벅스',
    name: '아메리카노 Tall',
    image: require('../assets/images/giftbox2.png'),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
  },
];

const HomeScreen = () => {
  const { theme } = useTheme();
  const username = '으라차차'; // 실제 앱에서는 로그인된 사용자 이름을 가져옵니다

  // 날짜 간격 계산 함수
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 기프티콘 아이템 렌더링
  const renderGiftItem = ({ item }) => {
    const daysLeft = calculateDaysLeft(item.expiryDate);
    return (
      <View style={styles.giftCard}>
        <View style={styles.giftImageContainer}>
          <Image source={item.image} style={styles.giftImage} resizeMode="contain" />
        </View>
        <View style={styles.giftInfo}>
          <Text style={styles.giftBrand}>{item.brand}</Text>
          <Text style={styles.giftName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
        </View>
        <View style={styles.dDayContainer}>
          <Text style={styles.dDayText}>D-{daysLeft}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>홈</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 환영 메시지 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            어서오세요! <Text style={{ color: theme.colors.primary }}>{username}</Text> 님,
          </Text>
          <Text style={styles.subWelcomeText}>당신을 위한 기프티콘이 기다려요.</Text>
        </View>

        {/* 만료 임박 기프티콘 섹션 */}
        <View style={styles.giftListContainer}>
          <FlatList
            data={SAMPLE_GIFTICONS}
            renderItem={renderGiftItem}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.giftListContent}
          />
        </View>

        {/* 중간 카드 섹션 (쉐어박스, 나누기) */}
        <View style={styles.middleCardSection}>
          <View style={styles.middleCardRow}>
            {/* 쉐어박스 & 나누기 카드 */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                나누면{'\n'}즐거움 두배,{'\n'}쉐어박스
              </Text>
              <View style={styles.shareBoxIcon}>
                <Icon name="inventory-2" size={24} color="#888" />
                <Text style={styles.shareBoxCount}>34개 쉐어 중</Text>
              </View>
            </View>

            {/* 레이더 카드 */}
            <View style={styles.radarCard}>
              <Text style={styles.radarText}>쓱 - 나누기{'\n'}행운의 주인공은?</Text>
              <Image
                source={require('../assets/images/home-radar.png')}
                style={styles.fullRadarImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* 하단 선물 카드 */}
        <View style={styles.giftCard2}>
          <View style={styles.giftCard2Content}>
            <View>
              <Text style={styles.giftCard2Text}>기프티콘 선물해봐요!</Text>
              <Text style={styles.giftCard2SubText}>포장은 저희가 해드릴게요.</Text>
            </View>
            <Image
              source={require('../assets/images/home-gift.png')}
              style={styles.giftCard2Image}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerSection: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  welcomeSection: {
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
  },
  subWelcomeText: {
    fontSize: 18,
    fontWeight: '400',
    marginTop: 4,
    color: 'black',
  },
  giftListContainer: {
    marginBottom: 20,
  },
  giftListContent: {
    paddingRight: 16,
  },
  giftCard: {
    width: 190,
    height: 220,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f4ff',
  },
  giftImageContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
  },
  giftImage: {
    width: '70%',
    height: '70%',
  },
  giftInfo: {
    paddingHorizontal: 10,
  },
  giftBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  giftName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  dDayContainer: {
    backgroundColor: '#F6C5C5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  dDayText: {
    color: '#D33434',
    fontSize: 14,
    fontWeight: '600',
  },
  middleCardSection: {
    marginBottom: 20,
  },
  middleCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '47%',
    height: 160,
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    justifyContent: 'start',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    lineHeight: 24,
  },
  shareBoxIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  shareBoxCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  radarCard: {
    width: '47%',
    height: 160,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  },
  radarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    textAlign: 'right',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 16,
    zIndex: 1,
    lineHeight: 24,
  },
  fullRadarImage: {
    width: '100%',
    height: '100%',
  },
  giftCard2: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
  },
  giftCard2Content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  giftCard2Text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  giftCard2SubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  giftCard2Image: {
    width: 140,
    height: 80,
  },
});

export default HomeScreen;
