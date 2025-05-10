import { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import GiveAwayGifticonList from '../components/GiveAwayGifticonList';
import GifticonConfirmModal from '../components/GifticonConfirmModal';

const { width, height } = Dimensions.get('window');
const GiveawayButtonImg = require('../../assets/GiveawayButtonImg.png');
const emoji1 = require('../../assets/emoji1.png');
const emoji2 = require('../../assets/emoji2.png');
const emoji3 = require('../../assets/emoji3.png');

const dummyUsers = [
  { id: 1, name: '안*진', emoji: emoji1, distance: '5m' },
  { id: 2, name: 'Gw*ter', emoji: emoji2, distance: '10m' },
  { id: 3, name: '스타*명', emoji: emoji2, distance: '15m' },
  { id: 4, name: '정*은', emoji: emoji3, distance: '8m' },
  { id: 5, name: '류*문', emoji: emoji3, distance: '12m' },
];

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

const GiveAwayScreen = () => {
  const [users, setUsers] = useState([]);
  const [listVisible, setListVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const userPositionsRef = useRef([]);

  // 원의 중심 좌표
  const centerX = width / 2;
  const centerY = height / 2;

  const smallestRadius = width * 0.15;
  const diameter = smallestRadius * 2;
  const spacingRatio = 0.6;
  const circleSpacing = diameter * 0.7;

  // 4개의 원의 반지름 배열 - 중앙 원부터 바깥쪽으로
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
      // 다양한 거리에 배치하기 위해 반지름 배열 사용
      const distanceIndex = i % 3; // 0, 1, 2 값을 순환
      let userRadius;

      // 사용자를 다양한 원에 배치
      if (distanceIndex === 0) {
        userRadius = smallestRadius + circleSpacing * 0.7; // 가까운 원
      } else if (distanceIndex === 1) {
        userRadius = smallestRadius + circleSpacing * 1.5; // 중간 원
      } else {
        userRadius = smallestRadius + circleSpacing * 2.2; // 먼 원
      }

      // 각도에 따른 좌표 계산
      const angle = startAngle + angleStep * i;
      const x = centerX + userRadius * Math.cos(angle);
      const y = centerY + userRadius * Math.sin(angle);

      // 거리에 따른 크기와 투명도 계산 (원근감)
      const scale = 1 - distanceIndex * 0.15; // 0: 100%, 1: 85%, 2: 70%
      const opacity = 1 - distanceIndex * 0.1; // 0: 100%, 1: 90%, 2: 80%

      positions.push({ x, y, scale, opacity, distanceIndex });
    }

    userPositionsRef.current = positions;
    return positions;
  };

  useEffect(() => {
    setUsers(dummyUsers);
    calculateUserPositions(dummyUsers);
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

  // 목록 닫기 버튼 선택 시
  const handleGifticonListCancel = () => {
    setListVisible(false);
    setButtonVisible(true);
  };

  // 선택 확인 모달에서 '확인' 버튼 핸들러
  const handleConfirm = () => {
    setConfirmModalVisible(false);
    setListVisible(false);
    setButtonVisible(false);
  };

  // 선택 확인 모달에서 '취소' 버튼 핸들러
  const handleCancel = () => {
    setConfirmModalVisible(false);
  };

  // 사용자 위치 계산 (고정)
  const userPositions = calculateUserPositions(users);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f1f7ff" barStyle="dark-content" />

      <View style={styles.svgContainer}>
        <Svg width={width * 2} height={height * 2} style={styles.svgImage}>
          {radiusArray.map((radius, index) => (
            <Circle
              key={index}
              cx={centerX * 2}
              cy={centerY * 2}
              r={radius}
              stroke="#CCCCCC"
              strokeWidth="1"
              fill="transparent"
            />
          ))}
        </Svg>

        {users.map((user, index) => {
          const position = userPositions[index];
          const baseSize = 80;
          const adjustedSize = baseSize * position.scale; // 원근감에 따른 크기 조정

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
                  zIndex: 10 - position.distanceIndex, // 먼 요소가 뒤로 가도록 z-index 설정
                },
              ]}
            >
              <View style={[styles.emojiContainer, { width: adjustedSize, height: adjustedSize }]}>
                <Image
                  source={user.emoji}
                  style={{
                    width: adjustedSize,
                    height: adjustedSize,
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <Text style={[styles.userName, { fontSize: 15 * position.scale }]}>{user.name}</Text>
            </View>
          );
        })}
      </View>

      {/* 뿌리기 기프티콘 목록 버튼 */}
      {buttonVisible && (
        <TouchableOpacity style={styles.giveawayButton} onPress={handleButtonClick}>
          <Image source={GiveawayButtonImg} style={styles.buttonImage} />
        </TouchableOpacity>
      )}

      {/* 기프티콘 목록 컴포넌트 */}
      {listVisible && (
        <View style={styles.gifticonListContainer}>
          <GiveAwayGifticonList
            gifticons={dummyGifticons.gifticons}
            onSelectGifticon={handleGifticonSelect}
          />
        </View>
      )}

      {/* 기프티콘 선택 확인 모달 컴포넌트 */}
      <GifticonConfirmModal
        visible={confirmModalVisible}
        selectedGifticon={selectedGifticon}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF9FF',
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
    left: -width * 0.5,
    top: -height * 0.5,
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
});

export default GiveAwayScreen;
