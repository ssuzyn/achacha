import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Text } from '../components/ui';
import { Shadow } from 'react-native-shadow-2';
import NavigationService from '../navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from 'react-native-reanimated-carousel';
import Animated from 'react-native-reanimated';

// 샘플 데이터 - 실제 앱에서는 API 또는 Redux 스토어에서 가져올 것입니다.
const SAMPLE_GIFTICONS = [
  {
    id: '1',
    brand: '맥도날드',
    name: '모바일 금액권 20,000원',
    image: require('../assets/images/dummy_mc.png'),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
  },
  {
    id: '2',
    brand: '메가MGC커피',
    name: '(핫)아이스라떼',
    image: require('../assets/images/dummy_mega.png'),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
  },
  {
    id: '3',
    brand: '스타벅스',
    name: '아메리카노 Tall',
    image: require('../assets/images/dummy_starbucks.png'),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
  },
];

// 캐러셀에 표시할 카드 데이터
const CAROUSEL_CARDS = [
  {
    id: '1',
    type: 'sharebox',
    title: '나누면 즐거움이 두배,\n쉐어박스',
    image: require('../assets/images/share_box.png'),
    iconName: 'inventory-2',
    onPress: () => NavigationService.navigate('TabSharebox'),
  },
  {
    id: '2',
    type: 'radar',
    title: '쓱 - 뿌리기\n행운의 주인공은?',
    image: require('../assets/images/home_radar.png'),
    onPress: () => NavigationService.navigate('TabMap'),
  },
  {
    id: '3',
    type: 'gift',
    title: '기프티콘을 선물해봐요!',
    subtitle: '포장은 저희가 해드릴게요.',
    image: require('../assets/images/home_gift.png'),
    onPress: () => NavigationService.navigate('TabGifticonManage'),
  },
];

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
  const { theme } = useTheme();
  const username = '으라차차'; // 실제 앱에서는 로그인된 사용자 이름을 가져옵니다
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const printTokens = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
    };
    printTokens();
  }, []);

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

  // 캐러셀 아이템 렌더링
  const renderCarouselItem = ({ item, index }) => {
    if (item.type === 'sharebox') {
      return (
        <Animated.View style={styles.carouselCard}>
          <TouchableOpacity onPress={item.onPress} style={{ width: '100%', height: '100%' }}>
            <View style={[styles.giftMessageCard, { backgroundColor: '#F0ECFF' }]}>
              <View style={styles.giftMessageTextContainerSharebox}>
                <Text variant="h3" weight="bold" style={styles.giftMessageTitle}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.giftMessageImageContainer}>
                <Image source={item.image} style={styles.giftMessageImage1} resizeMode="contain" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    } else if (item.type === 'radar') {
      return (
        <Animated.View style={styles.carouselCard}>
          <TouchableOpacity onPress={item.onPress} style={{ width: '100%', height: '100%' }}>
            <View style={[styles.giftMessageCard, { backgroundColor: '#FDF3E3' }]}>
              <View style={styles.giftMessageTextContainerRadar}>
                <Text variant="h3" weight="bold" style={styles.giftMessageTitle}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.giftMessageImageContainer}>
                <Image source={item.image} style={styles.giftMessageImage2} resizeMode="contain" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    } else if (item.type === 'gift') {
      return (
        <Animated.View style={styles.carouselCard}>
          <TouchableOpacity onPress={item.onPress} style={{ width: '100%', height: '100%' }}>
            <View style={styles.giftMessageCard}>
              <View style={styles.giftMessageTextContainer}>
                <Text variant="h3" weight="bold" style={styles.giftMessageTitle}>
                  {item.title}
                </Text>
                <Text variant="body1" weight="regular" style={styles.giftMessageSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={styles.giftMessageImageContainer}>
                <Image source={item.image} style={styles.giftMessageImage} resizeMode="contain" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    return null;
  };

  // 인디케이터 렌더링
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {CAROUSEL_CARDS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: activeIndex === index ? theme.colors.primary : '#D9D9D9' },
            ]}
          />
        ))}
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
            <Text variant="h3" weight="bold" color="primary" style={null}>
              {username}
            </Text>{' '}
            님,
          </Text>
          <Text variant="h3" weight="bold" style={styles.welcomeText}>
            당신을 위한 기프티콘이 기다려요.
          </Text>
        </View>

        {/* 캐러셀 섹션 */}
        <View style={styles.carouselSection}>
          <Carousel
            ref={carouselRef}
            width={screenWidth - 30}
            height={130}
            data={CAROUSEL_CARDS}
            renderItem={renderCarouselItem}
            onSnapToItem={setActiveIndex}
            loop
            autoPlay={true}
            autoPlayInterval={4000}
            style={{ borderRadius: 15, overflow: 'hidden' }}
            defaultIndex={0}
            enabled={true}
            snapEnabled
            pagingEnabled
            mode="default"
            modeConfig={{
              snapDirection: 'left',
              stackInterval: 0,
              moveSize: undefined,
            }}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
            withAnimation={{
              type: 'timing',
              config: {
                duration: 600,
              },
            }}
          />
          {renderPagination()}
        </View>

        {/* 만료 임박 기프티콘 섹션 */}
        <View style={styles.giftListContainer}>
          <Text variant="h5" weight="medium" style={styles.giftListTitle}>
            만료 임박 기프티콘
          </Text>
          <FlatList
            data={SAMPLE_GIFTICONS}
            renderItem={renderGiftItem}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.giftListContent}
          />
        </View>

        {/* 선물 카드 */}
        <View style={styles.bottomCardSection}>
          <TouchableOpacity onPress={() => NavigationService.navigate('TabGifticonManage')}>
            <View style={styles.mapMessageCard}>
              <ImageBackground
                source={require('../assets/images/map.png')}
                style={styles.mapBackgroundImage}
                imageStyle={styles.mapBackgroundImageStyle}
              >
                <View style={styles.mapOverlay}>
                  <View style={styles.mapMessageTextContainer}>
                    <View style={styles.mapTitleContainer}>
                      <Image
                        source={require('../assets/images/map_marker.png')}
                        style={styles.mapMarkerImage}
                        resizeMode="contain"
                      />
                      <Text variant="h4" weight="bold" style={styles.mapMessageTitle}>
                        발견부터 설렘까지, 기프티콘 MAP
                      </Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
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
    marginBottom: 15,
  },
  welcomeText: {
    letterSpacing: -0.3,
    fontSize: 20,
    lineHeight: 28,
  },
  carouselSection: {
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  carouselCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 130,
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    marginVertical: 3,
  },
  giftListContainer: {
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  giftListTitle: {
    letterSpacing: -0.3,
    marginLeft: 5,
    marginBottom: 10,
  },
  giftListContent: {
    paddingRight: 10,
    paddingBottom: 5,
  },
  shadowContainer: {
    borderRadius: 12,
    width: '100%',
  },
  giftItemContainer: {
    width: 180,
    marginRight: 10,
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
    paddingHorizontal: 2,
  },
  giftMessageCard: {
    backgroundColor: '#E5F4FE',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 130,
    overflow: 'hidden',
    position: 'relative',
  },
  giftMessageTextContainer: {
    flex: 1.5,
    paddingLeft: 10,
    paddingRight: 0,
    justifyContent: 'center',
    height: '100%',
  },
  giftMessageTextContainerRadar: {
    flex: 1.5,
    paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'center',
    height: '100%',
  },
  giftMessageTextContainerSharebox: {
    flex: 1.5,
    paddingLeft: 25,
    paddingRight: 10,
    justifyContent: 'center',
    height: '100%',
  },
  giftMessageTitle: {
    marginBottom: 2,
    letterSpacing: -0.2,
    lineHeight: 30,
  },
  giftMessageSubtitle: {
    color: '#737373',
    letterSpacing: -0.3,
  },
  giftMessageImageContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop: -10,
    marginBottom: -10,
  },
  giftMessageImage: {
    width: 100,
    height: 100,
  },
  giftMessageImage1: {
    width: 100,
    height: 100,
    marginRight: 20,
  },
  giftMessageImage2: {
    width: 150,
    height: 150,
    marginRight: 15,
  },
  mapMessageCard: {
    borderRadius: 15,
    overflow: 'hidden',
    height: 130,
  },
  mapBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  mapBackgroundImageStyle: {
    borderRadius: 15,
  },
  mapOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    flex: 1,
    padding: 15,
    flexDirection: 'row',
  },
  mapMessageTextContainer: {
    flex: 1.5,
    paddingLeft: 10,
    paddingRight: 0,
    justifyContent: 'center',
    height: '100%',
  },
  mapTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mapMarkerImage: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  mapMessageTitle: {
    alignSelf: 'center',
    marginBottom: 2,
    letterSpacing: -0.2,
    lineHeight: 30,
    color: '#000000',
  },
});

export default HomeScreen;
