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
  PanResponder,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import GiveAwayGifticonList from '../components/GiveAwayGifticonList';
import GifticonConfirmModal from '../components/GifticonConfirmModal';
import LottieView from 'lottie-react-native';
import { BLENearbyUsersService } from '../services/NearbyUsersService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import useDeviceStore from '../store/deviceStore';

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
  const bleServiceRef = useRef(null);
  const navigation = useNavigation();
  const [giftSentUserId, setGiftSentUserId] = useState(null);
  const [receivedUserAnim] = useState(new Animated.Value(0));
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  // BLE 관련 상태
  const { appUUID, userUUID, initializeUUIDs } = useDeviceStore();
  const [isTransferring, setIsTransferring] = useState(false);

  // 애니메이션을 위한 값
  const buttonPositionAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(1)).current;

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

  // 두번째 원 직경 계산 (Lottie 애니메이션 크기로 사용)
  const secondCircleDiameter = radiusArray[1] * 2;

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

  // PanResponder 설정 - 기프티콘 뿌리기 버튼을 드래그할 때 사용
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 더 낮은 임계값으로 더 빠르게 움직임 감지
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        // 드래그 시작시 크기 변경 효과 더 빠르게
        Animated.spring(buttonScaleAnim, {
          toValue: 1.2,
          friction: 2, // 마찰 더 감소
          tension: 80, // 장력 증가
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        // 드래그 움직임 증폭 (1.2배 더 민감하게)
        buttonPositionAnim.setValue({
          x: gestureState.dx * 1.2,
          y: gestureState.dy * 1.2,
        });
      },
      onPanResponderRelease: (e, gesture) => {
        // 드래그 위치에서 가장 가까운 사용자 찾기
        const closestUser = findClosestUser(gesture.moveX, gesture.moveY);

        if (closestUser) {
          // 가장 가까운 사용자에게 기프티콘 보내기
          sendGifticonToUser(closestUser);
        } else {
          // 사용자가 근처에 없으면 원래 위치로 돌아가기
          resetButtonPosition();
        }
      },
    })
  ).current;

  // 가장 가까운 사용자 찾기
  const findClosestUser = (x, y) => {
    if (!users.length) return null;

    let closestUser = null;
    let minDistance = 9999;

    users.forEach((user, index) => {
      const position = userPositions[index];
      const distance = Math.sqrt(Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2));

      // 일정 거리 이내에 있고, 지금까지 발견한 것보다 더 가까우면 업데이트
      if (distance < 100 && distance < minDistance) {
        minDistance = distance;
        closestUser = { ...user, position };
      }
    });

    return closestUser;
  };

  // 버튼 위치 초기화
  const resetButtonPosition = () => {
    Animated.parallel([
      Animated.spring(buttonPositionAnim, {
        toValue: { x: 0, y: 0 },
        friction: 3,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 사용자에게 기프티콘 전송
  const sendGifticonToUser = async user => {
    if (!selectedGifticon || !user) return;

    setIsTransferring(true);
    setGiftSentUserId(user.id);

    // 버튼을 사용자 쪽으로 애니메이션
    Animated.parallel([
      Animated.timing(buttonPositionAnim, {
        toValue: {
          x: user.position.x - width / 2,
          y: user.position.y - height / 2,
        },
        duration: 250, // 더 빠르게 (300ms → 250ms)
        useNativeDriver: false,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 0.5,
        duration: 200, // 더 빠르게 (250ms → 200ms)
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacityAnim, {
        toValue: 0,
        duration: 300, // 더 빠르게 (400ms → 300ms)
        useNativeDriver: true,
        delay: 150, // 지연 시간 감소 (200ms → 150ms)
      }),
    ]).start(async () => {
      try {
        // 선물 효과 바로 시작
        addReceivedAnimation(user.id);

        // BLE 전송 시작 - BLENearbyUsersService 사용
        const giftData = {
          gifticonId: selectedGifticon.gifticonId,
          senderId: userUUID || 'test-sender-id',
          senderName: '내 이름', // 실제 앱에서는 로그인 사용자 이름 사용
          receiverId: user.id,
          timestamp: new Date().toISOString(),
        };

        console.log(`기프티콘 전송 시작: ${JSON.stringify(giftData)}`);

        // BLE 서비스를 통해 데이터 전송
        const result = await bleServiceRef.current.sendGifticon(user.id, giftData);

        if (result.success) {
          // 전송 완료 후 추가 효과 (선물 효과는 이미 시작했음)

          // 짧은 딜레이 후 알림 표시 (시각적 효과 감상 시간 확보)
          setTimeout(() => {
            Alert.alert('기프티콘 전송 완료', `${user.name}님에게 기프티콘을 전송했습니다!`, [
              {
                text: '확인',
                onPress: () => {
                  // 버튼 초기화 및 새로운 기프티콘 선택 가능하도록 설정
                  resetAfterSend();
                },
              },
            ]);
          }, 800);
        } else {
          throw new Error(result.error || '전송 실패');
        }
      } catch (error) {
        console.error('기프티콘 전송 오류:', error);
        Alert.alert('전송 실패', '기프티콘 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
        resetButtonPosition();
      } finally {
        setIsTransferring(false);
        buttonOpacityAnim.setValue(1);
      }
    });
  };

  // 전송 후 초기화 및 버튼 중앙으로 복귀
  const resetAfterSend = () => {
    // 버튼 위치 및 상태 초기화
    buttonPositionAnim.setValue({ x: 0, y: 0 });
    buttonScaleAnim.setValue(1);
    buttonOpacityAnim.setValue(1);

    // 상태 초기화
    setGiftSentUserId(null);
    setSelectedGifticon(null);
    setIsTransferring(false);

    // 툴팁 숨기기
    setShowTooltip(false);
    tooltipOpacity.setValue(0);

    // 새 기프티콘 선택 가능하도록 리스트 버튼 표시
    setCenterButtonVisible(false);
    setButtonVisible(true);
  };

  // 수신자 효과 애니메이션
  const addReceivedAnimation = userId => {
    // 수신자 효과 애니메이션 시작
    receivedUserAnim.setValue(0);
    Animated.sequence([
      Animated.timing(receivedUserAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(receivedUserAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(receivedUserAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(receivedUserAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(receivedUserAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // NearbyUsersService로 위치 공유 및 주변 유저 검색
  useEffect(() => {
    let interval;
    // (실제 사용자 ID를 사용하세요)
    const userId = userUUID || 'my-user-id';

    const initialize = async () => {
      try {
        setLoading(true);
        // 로딩 시작 시간 기록
        const loadingStartTime = Date.now();

        // Zustand 스토어 초기화
        if (!appUUID) {
          await initializeUUIDs();
        }

        // BLE 서비스 초기화
        bleServiceRef.current = new BLENearbyUsersService();

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
          await bleServiceRef.current.init(userId);
          await bleServiceRef.current.startSharingLocation();
          const foundUsers = await bleServiceRef.current.findNearbyUsers();
          const hasUsers = foundUsers.length > 0 || dummyUsers.length > 0;

          // 최대 5명의 유저만 표시
          const limitedFoundUsers = foundUsers.length > 0 ? foundUsers.slice(0, 5) : [];
          const limitedUsers =
            limitedFoundUsers.length > 0 ? limitedFoundUsers : dummyUsers.slice(0, 5);

          // 현재 시간과 로딩 시작 시간의 차이 계산
          const elapsedTime = Date.now() - loadingStartTime;
          const minLoadingTime = 3000; // 최소 3초

          // 최소 3초 동안 로딩 애니메이션 표시
          if (elapsedTime < minLoadingTime) {
            await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
          }

          setUsers(limitedUsers);
          setLoading(false);
          // 주변에 유저가 있을 때만 버튼을 보이게 함
          setButtonVisible(hasUsers);
        } catch (error) {
          console.error('근처 사용자 서비스 초기화 실패:', error);

          // 오류가 발생해도 최소 3초 동안 로딩 애니메이션 표시
          const elapsedTime = Date.now() - loadingStartTime;
          const minLoadingTime = 3000; // 최소 3초

          if (elapsedTime < minLoadingTime) {
            await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
          }

          // 더미 데이터도 최대 5명으로 제한
          setUsers(dummyUsers.slice(0, 5));
          setLoading(false);
          // 더미 데이터가 있으면 버튼 보이게 함
          setButtonVisible(dummyUsers.length > 0);
        }
      } catch (error) {
        console.error('초기화 중 오류:', error);
        // 최소 3초 후에 로딩 상태 해제
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      }
    };

    initialize();

    return () => {
      if (interval) clearInterval(interval);
      if (bleServiceRef.current) {
        try {
          bleServiceRef.current.cleanup();
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

    // Alert 대신 깜빡이는 툴팁 메시지 표시
    setShowTooltip(true);

    // 툴팁 깜빡임 애니메이션
    Animated.sequence([
      Animated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tooltipOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tooltipOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2초 후 툴팁 숨기기
      setTimeout(() => {
        Animated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowTooltip(false);
        });
      }, 2000);
    });
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
                <LottieView
                  source={require('../assets/lottie/search_users.json')}
                  autoPlay
                  loop
                  style={{
                    width: secondCircleDiameter,
                    height: secondCircleDiameter,
                  }}
                />
              </View>
            </>
          ) : (
            users.map((user, index) => {
              const position = userPositions[index];
              const baseSize = 80;
              const adjustedSize = baseSize * position.scale;

              // 수신자 효과 애니메이션 적용
              const pulseScale =
                giftSentUserId === user.id
                  ? receivedUserAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.3, 1],
                    })
                  : 1;

              const glowOpacity =
                giftSentUserId === user.id
                  ? receivedUserAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.8],
                    })
                  : 0;

              return (
                <Animated.View
                  key={`user-${user.id}`}
                  style={[
                    styles.userContainer,
                    {
                      left: position.x - adjustedSize / 2,
                      top: position.y - adjustedSize / 2,
                      width: adjustedSize,
                      opacity: position.opacity,
                      zIndex: 10 - position.distanceIndex,
                      transform: [{ scale: giftSentUserId === user.id ? pulseScale : 1 }],
                    },
                    // 선물을 받은 사용자에게 효과 추가
                    giftSentUserId === user.id && styles.receivedGift,
                  ]}
                >
                  {/* 선물 받은 사용자 주변 효과 */}
                  {giftSentUserId === user.id && (
                    <Animated.View
                      style={[
                        styles.giftGlow,
                        {
                          width: adjustedSize * 1.5,
                          height: adjustedSize * 1.5,
                          opacity: glowOpacity,
                        },
                      ]}
                    />
                  )}

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
                </Animated.View>
              );
            })
          )}

          {/* 깜빡이는 툴팁 메시지 */}
          {showTooltip && (
            <Animated.View style={[styles.tooltipContainer, { opacity: tooltipOpacity }]}>
              <View style={styles.tooltipBubble}>
                <Text style={styles.tooltipText}>
                  선물 버튼을 원하는 방향으로 드래그하면 기프티콘 뿌리기가 시작됩니다!
                </Text>
              </View>
            </Animated.View>
          )}

          {/* 기프티콘 선택 후 중앙에 표시될 버튼 - 이제 드래그 가능 */}
          {centerButtonVisible && !isTransferring && (
            <Animated.View
              style={[
                styles.centerButtonContainer,
                {
                  transform: [
                    { translateX: buttonPositionAnim.x },
                    { translateY: buttonPositionAnim.y },
                    { scale: buttonScaleAnim },
                  ],
                  opacity: buttonOpacityAnim,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Image source={giveAwayButtonImg} style={styles.centerButtonImage} />
            </Animated.View>
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
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
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
  receivedGift: {
    shadowColor: '#FFDC4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  giftGlow: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderRadius: 100,
    zIndex: -1,
    alignSelf: 'center',
    top: -10,
    left: -10,
  },
  tooltipContainer: {
    position: 'absolute',
    top: height * 0.35,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  tooltipBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: width * 0.8,
  },
  tooltipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GiveAwayScreen;
