import React from 'react';
import { StyleSheet, ScrollView, View, FlatList, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import Card from '../components/ui/Card';
import { Text } from '../components/ui';
import { Shadow } from 'react-native-shadow-2';

// 샘플 데이터 - 실제 앱에서는 API 또는 Redux 스토어에서 가져올 것입니다.
const SAMPLE_GIFTICONS = [
  {
    id: '1',
    brand: '맥도날드',
    name: '모바일 금액권 20,000원',
    image: require('../assets/images/dummy-mc.png'),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
  },
  {
    id: '2',
    brand: '메가MGC커피',
    name: '(핫)아이스라떼',
    image: require('../assets/images/dummy-mega.png'),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
  },
  {
    id: '3',
    brand: '스타벅스',
    name: '아메리카노 Tall',
    image: require('../assets/images/dummy-starbucks.png'),
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
      <View style={styles.giftItemContainer}>
        <Shadow
          distance={12}
          startColor={'rgba(0, 0, 0, 0.008)'}
          offset={[0, 1]}
          style={styles.shadowContainer}
        >
          <View style={styles.giftCard}>
            <View style={styles.giftImageContainer}>
              <Image source={item.image} style={styles.giftImage} resizeMode="contain" />
            </View>
            <Text variant="body1" weight="regular" style={styles.giftBrand}>
              {item.brand}
            </Text>
            <Text
              variant="body2"
              weight="bold"
              style={styles.giftName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <View style={styles.dDayContainer}>
              <Text variant="body2" weight="bold" style={styles.dDayText}>
                D-{daysLeft}
              </Text>
            </View>
          </View>
        </Shadow>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 환영 메시지 */}
        <View style={styles.welcomeSection}>
          <Text variant="h3" weight="bold" style={styles.welcomeText}>
            어서오세요!{' '}
            <Text variant="h3" weight="bold" color="primary" style={styles.welcomeText}>
              {username}
            </Text>{' '}
            님,
          </Text>
          <Text variant="h3" weight="bold" style={styles.subWelcomeText}>
            당신을 위한 기프티콘이 기다려요.
          </Text>
        </View>

        {/* 만료 임박 기프티콘 섹션 */}
        <View style={styles.giftListContainer}>
          {/* <Text variant="h5" weight="medium" style={styles.giftListText}>
            만료 임박 기프티콘{' '}
          </Text> */}
          <FlatList
            data={SAMPLE_GIFTICONS}
            renderItem={renderGiftItem}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.giftListContent}
          />
        </View>

        {/* 중간 카드 섹션 (쉐어박스, 뿌리기) */}
        <View style={styles.middleCardSection}>
          <View style={styles.middleCardRow}>
            {/* 쉐어박스 & 뿌리기 카드 */}
            <Card.FeatureCard
              title={`나누면\n즐거움 두배,\n쉐어박스`}
              iconName="inventory-2"
              count="34개 쉐어 중"
            />

            {/* 레이더 카드 */}
            <Card.RadarCard
              text={`쓱 - 뿌리기\n행운의 주인공은?`}
              image={require('../assets/images/home-radar.png')}
            />
          </View>
        </View>

        {/* 하단 선물 카드 */}
        <View style={styles.bottomCardSection}>
          <View style={styles.giftMessageCard}>
            <View style={styles.giftMessageTextContainer}>
              <Text variant="h4" weight="bold" style={styles.giftMessageTitle}>
                기프티콘 선물해봐요!
              </Text>
              <Text variant="body2" weight="regular" style={styles.giftMessageSubtitle}>
                포장은 저희가 해드릴게요.
              </Text>
            </View>
            <View style={styles.giftMessageImageContainer}>
              <Image
                source={require('../assets/images/home-gift.png')}
                style={styles.giftMessageImage}
                resizeMode="contain"
              />
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
    paddingHorizontal: 2,
    paddingTop: 0,
  },
  contentContainer: {
    paddingTop: 0,
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  welcomeText: {
    letterSpacing: -0.3,
  },
  // giftListText: {
  //   paddingHorizontal: 8,
  //   letterSpacing: -0.3,
  //   marginLeft: 5,
  //   marginTop: 10,
  // },
  giftListContainer: {
    marginBottom: 5,
    paddingHorizontal: 2,
  },
  giftListContent: {
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 10,
    paddingBottom: 10,
  },
  middleCardSection: {
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  middleCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  giftCard: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 5,
    overflow: 'visible',
  },
  giftImageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  giftImage: {
    width: '55%',
    height: '85%',
  },
  giftBrand: {
    color: '#000000',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  giftName: {
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 10,
    letterSpacing: -0.1,
  },
  dDayContainer: {
    backgroundColor: '#FCD9D9',
    width: '45%',
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  dDayText: {
    color: '#D33434',
    alignSelf: 'center',
    letterSpacing: -0.1,
  },
  bottomCardSection: {
    paddingHorizontal: 5,
  },
  giftMessageCard: {
    backgroundColor: '#E5F4FE',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 130,
    overflow: 'hidden',
    position: 'relative',
  },
  giftMessageTextContainer: {
    flex: 1.5,
    paddingRight: 10,
    justifyContent: 'flex-end',
    height: '100%',
    paddingBottom: 5,
  },
  giftMessageTitle: {
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  giftMessageSubtitle: {
    color: '#333',
    letterSpacing: -0.3,
  },
  giftMessageImageContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop: -20,
    marginBottom: -10,
  },
  giftMessageImage: {
    width: 100,
    height: 100,
  },
  shadowContainer: {
    borderRadius: 12,
    width: '100%',
  },
  giftItemContainer: {
    width: 180,
    marginRight: 10,
  },
});

export default HomeScreen;
