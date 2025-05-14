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
import Tooltip from '../components/Tooltip';
import LottieView from 'lottie-react-native';
import nearbyUsersService from '../services/nearbyUsersService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../store/authStore';
import { PermissionsAndroid } from 'react-native';

const { width, height } = Dimensions.get('window');
const giveAwayButtonImg = require('../assets/images/giveaway_button.png');
const emoji1 = require('../assets/images/emoji1.png');
const emoji2 = require('../assets/images/emoji2.png');
const emoji3 = require('../assets/images/emoji3.png');
const emoji4 = require('../assets/images/emoji4.png');
const emoji5 = require('../assets/images/emoji5.png');
// 사용자가 없을 때 표시할 이미지
const giveawayManagementImg = require('../assets/images/giveaway_management.png');
const giveawayShareboxImg = require('../assets/images/giveaway_sharebox.png');

// 더미 사용자 데이터를 상수로 선언
const DUMMY_USERS = [
  { id: 1, name: '안*진', emoji: emoji1 },
  { id: 2, name: 'Gw*ter', emoji: emoji2 },
  { id: 3, name: '스타*명', emoji: emoji3 },
  { id: 4, name: '정*은', emoji: emoji4 },
  { id: 5, name: '류*문', emoji: emoji5 },
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
  ],
  hasNextPage: true,
  nextPage: '1',
};

// 주변에 사용자가 없을 때 보여줄 컴포넌트
const NoUsersScreen = () => {
  const navigation = useNavigation();
  const [showTooltip, setShowTooltip] = useState(true);

  const handleGoToShareBox = () => {
    navigation.navigate('BoxMain');
  };

  const handleGoToManagement = () => {
    navigation.navigate('ManageList');
  };

  useEffect(() => {
    // 3초 후에 툴팁 숨기기
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.noUsersContainer}>
      {showTooltip && (
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>
              주변에 사용자가 없습니다.{'\n'}다음에 다시 시도해주세요.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.circleContainer}>
        <TouchableOpacity
          onPress={handleGoToShareBox}
          style={[styles.iconButton, styles.shareboxPosition]}
        >
          <Image source={giveawayShareboxImg} style={styles.iconImage} />
          <Text style={styles.iconText}>쉐어박스</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoToManagement}
          style={[styles.iconButton, styles.managementPosition]}
        >
          <Image source={giveawayManagementImg} style={styles.iconImage} />
          <Text style={styles.iconText}>기프티콘</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  const { bleToken } = useAuthStore();
  const [isTransferring, setIsTransferring] = useState(false);
  const [bluetoothReady, setBluetoothReady] = useState(false);

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
        // 드래그가 끝나면 항상 버튼을 원래 위치로 되돌리기
        resetButtonPosition();

        // 랜덤으로 주변 사용자 선택 (가까운 사용자 찾기 대신)
        if (users.length > 0) {
          const randomIndex = Math.floor(Math.random() * users.length);
          const selectedUser = { ...users[randomIndex], position: userPositions[randomIndex] };

          // 약간의 딜레이 후 전송 (버튼이 중앙으로 돌아간 후)
          setTimeout(() => {
            sendGifticonToUser(selectedUser);
          }, 100);
        }
      },
    })
  ).current;

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

    setGiftSentUserId(user.id);

    // 버튼을 사용자 쪽으로 애니메이션
    Animated.parallel([
      Animated.timing(buttonPositionAnim, {
        toValue: {
          x: user.position.x - width / 2,
          y: user.position.y - height / 2,
        },
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        delay: 150,
      }),
    ]).start(async () => {
      try {
        // 선물 효과 시작
        addReceivedAnimation(user.id);

        // BLE를 통한 실제 데이터 전송 - 현재는 콘솔 로그만 표시
        if (bleServiceRef.current && bluetoothReady) {
          try {
            console.log(`BLE를 통해 기프티콘 정보 전송 시도: ${user.id}, UUID: ${user.deviceUUID}`);

            // 실제 전송 코드는 추가 구현 필요 - 백엔드에서 랜덤 유저 선정 처리
            // 여기서는 선택한 사용자 ID와 기프티콘 ID만 서버에 전송하는 형태로 구현
            // await sendGifticonToServer(user.id, selectedGifticon.gifticonId);
          } catch (error) {
            console.error('기프티콘 전송 실패:', error);
          }
        }

        console.log(
          `기프티콘 전송 애니메이션 완료: 사용자 ${user.id}에게 ${selectedGifticon.gifticonName}`
        );

        // 짧은 딜레이 후 알림 표시
        setTimeout(() => {
          Alert.alert(
            '기프티콘 뿌리기 완료',
            `${user.name}님에게 ${selectedGifticon.gifticonName}을(를) 뿌렸습니다!`,
            [
              {
                text: '확인',
                onPress: () => {
                  // 버튼 초기화 및 새로운 기프티콘 선택 가능하도록 설정
                  resetAfterSend();
                },
              },
            ]
          );
        }, 800);
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
    const initialize = async () => {
      try {
        setLoading(true);
        // 로딩 시작 시간 기록
        const loadingStartTime = Date.now();

        // BLE 서비스 초기화
        try {
          // NearbyUsersService 초기화 - 싱글톤이므로 참조만 저장
          bleServiceRef.current = nearbyUsersService;

          // 현재 광고 중이라면 중지
          await bleServiceRef.current.stopAdvertising();

          // BLE 초기화
          const initResult = await bleServiceRef.current.initialize();
          setBluetoothReady(initResult);

          if (initResult) {
            // 스캔 시작 - 한 번만 실행
            let foundUsers = [];
            console.log('BLE 스캔 시작');

            try {
              const scanStartTime = Date.now();
              await new Promise(resolve => {
                bleServiceRef.current.startScan(
                  user => {
                    // 새 사용자가 발견될 때마다 호출되는 콜백
                    console.log('새 사용자 발견:', {
                      id: user.id,
                      name: user.name,
                      deviceUUID: user.deviceUUID,
                      rssi: user.rssi,
                      distance: user.distance,
                      timestamp: new Date(user.timestamp).toLocaleString(),
                    });
                  },
                  allUsers => {
                    // 스캔 완료 후 호출되는 콜백
                    console.log('스캔 완료, 발견된 사용자 수:', allUsers.length);
                    foundUsers = allUsers;

                    // 남은 시간 계산
                    const elapsedTime = Date.now() - scanStartTime;
                    const remainingTime = Math.max(5000 - elapsedTime, 0);

                    // 남은 시간이 있으면 대기 후 resolve
                    if (remainingTime > 0) {
                      console.log(`스캔 완료 후 ${remainingTime}ms 더 대기`);
                      setTimeout(resolve, remainingTime);
                    } else {
                      resolve();
                    }
                  }
                );

                // 5초 타이머 설정
                setTimeout(() => {
                  console.log('5초 스캔 시간 완료');
                  resolve();
                }, 5000);
              });

              console.log('BLE 스캔 및 대기 완료');
            } catch (error) {
              console.error('BLE 스캔 중 오류:', error);
            } finally {
              // 실제 사용자만 표시
              if (foundUsers.length > 0) {
                // NearbyUsersService에서 찾은 사용자 매핑
                const mappedUsers = foundUsers
                  .map((user, index) => {
                    // 사용자별로 다른 이모지 할당
                    const emojiOptions = [emoji1, emoji2, emoji3, emoji4, emoji5];
                    const emoji = emojiOptions[index % emojiOptions.length];

                    return {
                      id: user.id,
                      name: user.name || `사용자${index + 1}`,
                      emoji: emoji,
                      // BLE 정보도 저장
                      deviceUUID: user.deviceUUID,
                      rssi: user.rssi,
                    };
                  })
                  .slice(0, 5); // 최대 5명까지만

                // UI에 사용자 표시
                setUsers(mappedUsers);
                setButtonVisible(mappedUsers.length > 0);
              } else {
                // 사용자가 없을 때는 빈 배열 설정
                setUsers([]);
                setButtonVisible(false);
              }

              // 스캔이 완료되면 다시 광고 시작
              await bleServiceRef.current.startAdvertising();
            }
          } else {
            // BLE 초기화 실패 시 빈 배열 설정
            setUsers([]);
            setButtonVisible(false);
          }
        } catch (error) {
          console.error('BLE 서비스 초기화 실패:', error);
          // 오류 발생 시 빈 배열 설정
          setUsers([]);
          setButtonVisible(false);
        }

        // 현재까지 경과된 시간 계산
        const elapsedTime = Date.now() - loadingStartTime;
        const maxLoadingTime = 5000; // 최대 5초

        // 5초에서 경과 시간을 뺀 만큼만 더 대기
        if (elapsedTime < maxLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, maxLoadingTime - elapsedTime));
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        // 오류 발생 시 빈 배열 설정
        setUsers([]);
        setButtonVisible(false);
      }
    };

    initialize();

    // 컴포넌트 언마운트 시
    return () => {
      if (bleServiceRef.current) {
        try {
          // 스캔 중지
          bleServiceRef.current.stopScan();
          // 광고 다시 시작
          bleServiceRef.current.startAdvertising();
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

    // 툴팁 표시
    setShowTooltip(true);
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

  // 사용자 위치 계산
  const userPositions = calculateUserPositions(users);

  // 뒤로가기 버튼 핸들러
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const permissions = [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ];

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
          ) : users.length > 0 ? (
            // 사용자가 있을 때 UI
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
          ) : (
            // 사용자가 없을 때 UI
            <NoUsersScreen />
          )}

          {/* 툴팁 컴포넌트 */}
          <Tooltip
            visible={showTooltip}
            message="선물 버튼을 원하는 방향으로 드래그하면 기프티콘 뿌리기가 시작됩니다."
            autoHide={true}
            duration={2000}
          />

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
    top: '1%',
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipBubble: {
    backgroundColor: 'rgba(85, 85, 85, 0.6)',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 20,
  },
  tooltipText: {
    color: 'white',
    fontSize: 19,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  noUsersContainer: {
    position: 'absolute',
    width: width,
    height: height * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: width * 0.9,
    height: width * 0.9,
    position: 'relative',
  },
  iconButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
  },
  shareboxPosition: {
    top: 0,
    left: 0,
  },
  managementPosition: {
    bottom: 0,
    right: -13,
  },
  iconImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    textAlign: 'center',
  },
});

export default GiveAwayScreen;
