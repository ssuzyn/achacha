import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import GiveAwayGifticonList from '../components/GiveAwayGifticonList';
import GifticonConfirmModal from '../components/GifticonConfirmModal';
import SearchingAnimation from '../components/SearchingAnimation';
import NearbyUsersService from '../services/NearbyUsersService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const giveAwayButtonImg = require('../assets/images/giveaway-button.png');
const emoji1 = require('../assets/images/emoji1.png');
const emoji2 = require('../assets/images/emoji2.png');
const emoji3 = require('../assets/images/emoji3.png');
const emoji4 = require('../assets/images/emoji4.png');
const emoji5 = require('../assets/images/emoji5.png');

const dummyGifticons = {
  gifticons: [
    {
      gifticonId: 125,
      gifticonName: '스타벅스 5000원권',
      gifticonType: 'AMOUNT',
      gifticonExpiryDate: '2025-06-15',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/125.jpg',
    },
    {
      gifticonId: 129,
      gifticonName: '자바칩 프라푸치노',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-07-10',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/129.jpg',
    },
    {
      gifticonId: 127,
      gifticonName: '바닐라 프라푸치노',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-08-22',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/127.jpg',
    },
    {
      gifticonId: 131,
      gifticonName: '돌체 라떼',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-09-05',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/131.jpg',
    },
    {
      gifticonId: 123,
      gifticonName: '아메리카노',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-12-31',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/123.jpg',
    },
  ],
  hasNextPage: true,
  nextPage: '1',
};

const GiveAwayScreen = ({ onClose }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [listVisible, setListVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [centerButtonVisible, setCenterButtonVisible] = useState(false);
  const userPositionsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const nearbyUsersServiceRef = useRef(null);
  const navigation = useNavigation();

  // 원의 중심 좌표
  const centerX = width / 2;
  const centerY = height / 2;
  const smallestRadius = width * 0.15;
  const diameter = smallestRadius * 2;
  const spacingRatio = 0.6;
  const circleSpacing = diameter * 0.7;
  const radiusArray = [
    smallestRadius,
    smallestRadius + circleSpacing,
    smallestRadius + circleSpacing * 2,
    smallestRadius + circleSpacing * 3,
  ];

  // 여러 거리에 사용자를 배치하여 원근감 부여
  const calculateUserPositions = users => {
    if (userPositionsRef.current.length === users.length) {
      return userPositionsRef.current;
    }
    const positions = [];
    const startAngle = Math.PI / 4;
    const angleStep = (2 * Math.PI) / users.length;
    for (let i = 0; i < users.length; i++) {
      const distanceIndex = i % 3;
      let userRadius;
      if (distanceIndex === 0) {
        userRadius = smallestRadius + circleSpacing * 0.7;
      } else if (distanceIndex === 1) {
        userRadius = smallestRadius + circleSpacing * 1.5;
      } else {
        userRadius = smallestRadius + circleSpacing * 2.2;
      }
      const angle = startAngle + angleStep * i;
      const x = centerX + userRadius * Math.cos(angle);
      const y = centerY + userRadius * Math.sin(angle);
      const scale = 1 - distanceIndex * 0.15;
      const opacity = 1 - distanceIndex * 0.1;
      positions.push({ x, y, scale, opacity, distanceIndex });
    }
    userPositionsRef.current = positions;
    return positions;
  };

  // NearbyUsersService로 위치 공유 및 주변 유저 검색
  useEffect(() => {
    let interval;
    // (실제 사용자 ID를 사용하세요)
    const userId = 'my-user-id';
    const initialize = async () => {
      try {
        setLoading(true);
        nearbyUsersServiceRef.current = new NearbyUsersService();

        // 현재는 더미 데이터 사용
        const dummyUsers = [
          { id: 1, name: '안*진', emoji: emoji1, distance: '5m' },
          { id: 2, name: 'Gw*ter', emoji: emoji2, distance: '10m' },
          { id: 3, name: '스타*명', emoji: emoji3, distance: '15m' },
          { id: 4, name: '정*은', emoji: emoji4, distance: '8m' },
          { id: 5, name: '류*문', emoji: emoji5, distance: '12m' },
        ];

        // 서비스 사용 (에러 발생시 더미 데이터로 대체)
        try {
          await nearbyUsersServiceRef.current.init(userId);
          await nearbyUsersServiceRef.current.startSharingLocation();
          const foundUsers = await nearbyUsersServiceRef.current.findNearbyUsers();
          const hasUsers = foundUsers.length > 0 || dummyUsers.length > 0;
          setUsers(foundUsers.length > 0 ? foundUsers : dummyUsers);
          setLoading(false);
          // 주변에 유저가 있을 때만 버튼을 보이게 함
          setButtonVisible(hasUsers);
        } catch (error) {
          console.error('근처 사용자 서비스 초기화 실패:', error);
          setUsers(dummyUsers);
          setLoading(false);
          // 더미 데이터가 있으면 버튼 보이게 함
          setButtonVisible(dummyUsers.length > 0);
        }
      } catch (error) {
        console.error('초기화 중 오류:', error);
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (interval) clearInterval(interval);
      if (nearbyUsersServiceRef.current) {
        try {
          nearbyUsersServiceRef.current.cleanup();
        } catch (e) {
          console.error('정리 중 오류:', e);
        }
      }
    };
  }, []);

  // 선물 버튼 핸들러
  const handleButtonClick = () => {
    setListVisible(true);
    setButtonVisible(false);
  };

  // 기프티콘 선택 핸들러
  const handleGifticonSelect = gifticon => {
    setSelectedGifticon(gifticon);
    setConfirmModalVisible(true);
    setListVisible(false);
  };

  // 선택 확인 모달에서 '확인' 버튼 핸들러
  const handleConfirm = () => {
    setConfirmModalVisible(false);
    setListVisible(false);
    setButtonVisible(false);
    setCenterButtonVisible(true);
  };

  // 선택 확인 모달에서 '취소' 버튼 핸들러
  const handleCancel = () => {
    setConfirmModalVisible(false);
  };

  // 목록 외 영역 클릭 핸들러
  const handleOutsidePress = () => {
    if (listVisible) {
      setListVisible(false);
      setButtonVisible(true);
    }
  };

  // 사용자 위치 계산 (고정)
  const userPositions = calculateUserPositions(users);

  // 뒤로가기 버튼 핸들러
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.black }]}>기프티콘 뿌리기</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.svgContainer}
          activeOpacity={1}
          onPress={handleOutsidePress}
        >
          <Svg width={width} height={height} style={styles.svgImage}>
            {radiusArray.map((radius, index) => (
              <Circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke="#CCCCCC"
                strokeWidth="1"
                fill="transparent"
              />
            ))}
          </Svg>
          {loading ? (
            <>
              <View style={styles.loadingOverlay}>
                <SearchingAnimation size={smallestRadius * 2} />
              </View>
            </>
          ) : (
            users.map((user, index) => {
              const position = userPositions[index];
              const baseSize = 80;
              const adjustedSize = baseSize * position.scale;
              return (
                <View
                  key={`user-${user.id}`}
                  style={[
                    styles.userContainer,
                    {
                      left: position.x - adjustedSize / 2,
                      top: position.y - adjustedSize / 2,
                      width: adjustedSize,
                      opacity: position.opacity,
                      zIndex: 10 - position.distanceIndex,
                    },
                  ]}
                >
                  <View
                    style={[styles.emojiContainer, { width: adjustedSize, height: adjustedSize }]}
                  >
                    <Image
                      source={user.emoji || emoji1}
                      style={{
                        width: adjustedSize,
                        height: adjustedSize,
                        resizeMode: 'contain',
                      }}
                    />
                  </View>
                  <Text style={[styles.userName, { fontSize: 15 * position.scale }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.distanceText, { fontSize: 12 * position.scale }]}>
                    {user.distance}
                  </Text>
                </View>
              );
            })
          )}
          {/* 기프티콘 선택 후 중앙에 표시될 버튼 */}
          {centerButtonVisible && (
            <View style={styles.centerButtonContainer}>
              <Image source={giveAwayButtonImg} style={styles.centerButtonImage} />
            </View>
          )}
        </TouchableOpacity>

        {/* 뿌리기 기프티콘 목록 버튼 */}
        {buttonVisible && !loading && (
          <TouchableOpacity style={styles.giveawayButton} onPress={handleButtonClick}>
            <Image source={giveAwayButtonImg} style={styles.buttonImage} />
          </TouchableOpacity>
        )}

        {/* 기프티콘 목록 컴포넌트 */}
        {listVisible && (
          <TouchableOpacity
            style={styles.gifticonListContainer}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <GiveAwayGifticonList
              gifticons={dummyGifticons.gifticons}
              onSelectGifticon={handleGifticonSelect}
            />
          </TouchableOpacity>
        )}

        {/* 기프티콘 선택 확인 모달 컴포넌트 */}
        <GifticonConfirmModal
          visible={confirmModalVisible}
          selectedGifticon={selectedGifticon}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF9FF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButtonContainer: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 30,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  svgContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  svgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  userContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  emojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  emoji: {
    fontSize: 50,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  giveawayButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: 'rgba(131, 200, 245, 0.5)',
    borderColor: '#56AEE9',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  gifticonListContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: height * 0.2,
    zIndex: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  centerButtonImage: {
    width: 60,
    height: 70,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});

export default GiveAwayScreen;
