import React from 'react';
import { StyleSheet, ScrollView, View, Text, FlatList, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import Card from '../components/ui/Card';

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
        <Text style={styles.giftBrand}>{item.brand}</Text>
        <Text style={styles.giftName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.dDayContainer}>
          <Text style={styles.dDayText}>D-{daysLeft}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            <Card.FeatureCard
              title={`나누면\n즐거움 두배,\n쉐어박스`}
              iconName="inventory-2"
              count="34개 쉐어 중"
            />

            {/* 레이더 카드 */}
            <Card.RadarCard
              text={`쓱 - 나누기\n행운의 주인공은?`}
              image={require('../assets/images/home-radar.png')}
            />
          </View>
        </View>

        {/* 하단 선물 카드 */}
        <Card.GiftCard2
          title="기프티콘 선물해봐요!"
          subtitle="포장은 저희가 해드릴게요."
          image={require('../assets/images/home-gift.png')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginBottom: 20,
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
    marginBottom: 15,
  },
  giftListContent: {
    paddingRight: 14,
  },
  middleCardSection: {
    marginBottom: 15,
  },
  middleCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  giftCard: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'visible',
  },
  giftImageContainer: {
    width: '100%',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  giftImage: {
    width: '60%',
    height: '90%',
  },
  giftBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  giftName: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
  },
  dDayContainer: {
    backgroundColor: '#FCD9D9',
    width: '50%',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 12,
  },
  dDayText: {
    color: '#D33434',
    fontSize: 14,
    alignSelf: 'center',
    fontWeight: '600',
  },
});

export default HomeScreen;
