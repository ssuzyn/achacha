import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  StatusBar,
  PanResponder,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import GiveAwayGifticonList from '../../components/GiveAwayGifticonList';
import GifticonConfirmModal from '../../components/GifticonConfirmModal';
import Tooltip from '../../components/Tooltip';
import NoUsersScreen from './NoUsersScreen';
import LottieView from 'lottie-react-native';
import nearbyUsersService from '../../services/NearbyUsersService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../store/authStore';
import { PermissionsAndroid } from 'react-native';
import { mapGifticonService } from '../../services/mapGifticonService';

const { width, height } = Dimensions.get('window');
const giveAwayButtonImg = require('../../assets/images/giveaway_button.png');
const emoji1 = require('../../assets/images/emoji1.png');
const emoji2 = require('../../assets/images/emoji2.png');
const emoji3 = require('../../assets/images/emoji3.png');
const emoji4 = require('../../assets/images/emoji4.png');
const emoji5 = require('../../assets/images/emoji5.png');

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

  // 기프티콘 목록 관련 상태 추가
  const [giveAwayGifticons, setGiveAwayGifticons] = useState({
    gifticons: [],
    hasNextPage: false,
    nextPage: null,
  });
  const [isLoadingGifticons, setIsLoadingGifticons] = useState(false);

  // BLE 관련 상태
  const [isTransferring, setIsTransferring] = useState(false);
  const [bluetoothReady, setBluetoothReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

    setGiftSentUserId(user.uuid);
    setIsTransferring(true);

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
        addReceivedAnimation(user.uuid);

        // 더미 데이터로 전송 시뮬레이션
        console.log(
          `기프티콘 전송 시뮬레이션: 사용자 ${user.uuid}(${user.name})에게 ${selectedGifticon.gifticonName} 전송 중...`
        );

        // 전송 딜레이 시뮬레이션 (실제 네트워크 요청 대체)
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(
          `기프티콘 전송 애니메이션 완료: 사용자 ${user.name}에게 ${selectedGifticon.gifticonName}`
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

  // 스캔 시작 함수
  const startScanning = async () => {
    if (!bleServiceRef.current || isScanning) {
      console.log(
        '[BLE 스캔] 스캔 시작 불가:',
        !bleServiceRef.current ? 'BLE 서비스가 초기화되지 않음' : '이미 스캔 중'
      );
      return;
    }

    try {
      setIsScanning(true);
      setLoading(true);
      console.log('[BLE 스캔] 스캔 시작 시간:', new Date().toISOString());

      // 발견된 사용자 정보 저장 (직접 배열에 추가)
      let discoveredUsers = [];

      // 사용자 발견 콜백
      const onUserFound = user => {
        console.log('[BLE 스캔] 새 사용자 발견 콜백:', user);
        // 중복 체크
        if (!discoveredUsers.some(u => u.uuid === user.uuid)) {
          discoveredUsers.push(user);
        }
      };

      // 스캔 완료 콜백
      const onScanComplete = allUsers => {
        console.log('[BLE 스캔] 스캔 완료 콜백, 발견된 사용자 수:', allUsers.length);

        // 스캔 결과 처리
        if (allUsers.length > 0) {
          const mappedUsers = allUsers
            .map((user, index) => {
              const emojiOptions = [emoji1, emoji2, emoji3, emoji4, emoji5];
              const emoji = emojiOptions[index % emojiOptions.length];

              // 더 자세한 로그
              console.log('[BLE 스캔] 매핑된 사용자 정보:', {
                uuid: user.uuid,
                name: user.bleToken || user.name || `사용자${index + 1}`,
                serviceUUID: user.serviceUUID,
                bleToken: user.bleToken,
                emoji,
              });

              return {
                uuid: user.uuid,
                name: user.bleToken || user.name || `사용자${index + 1}`, // bleToken을 이름으로 사용
                emoji: emoji,
                deviceId: user.deviceId,
              };
            })
            .slice(0, 5);

          console.log('[BLE 스캔] 최종 표시될 사용자:', {
            총_사용자_수: mappedUsers.length,
            사용자_목록: mappedUsers,
          });

          // 상태 업데이트
          setUsers(mappedUsers);
          setButtonVisible(mappedUsers.length > 0);
          setLoading(false);
        } else {
          console.log('[BLE 스캔] 주변에 사용자가 없음');
          setUsers([]);
          setButtonVisible(false);
          setLoading(false);
        }
      };

      // 스캔 시작
      await bleServiceRef.current.startScan(onUserFound, onScanComplete);
    } catch (error) {
      console.error('[BLE 스캔] 스캔 중 오류 발생:', error);
      setUsers([]);
      setButtonVisible(false);
      setLoading(false);
    }
  };

  // 스캔 중지 함수도 로그 추가
  const stopScanning = async () => {
    if (!bleServiceRef.current || !isScanning) {
      console.log(
        '[BLE 스캔] 스캔 중지 불가:',
        !bleServiceRef.current ? 'BLE 서비스 없음' : '스캔 중이 아님'
      );
      return;
    }

    try {
      console.log('[BLE 스캔] 스캔 중지 시작');
      await bleServiceRef.current.stopScan();
      console.log('[BLE 스캔] 스캔 중지 완료');
    } catch (error) {
      console.error('[BLE 스캔] 스캔 중지 중 오류 발생:', {
        에러_메시지: error.message,
        에러_스택: error.stack,
        발생_시간: new Date().toISOString(),
      });
    } finally {
      setIsScanning(false);
    }
  };

  // NearbyUsersService로 위치 공유 및 주변 유저 검색
  useEffect(() => {
    const initialize = async () => {
      try {
        // BLE 서비스 초기화
        bleServiceRef.current = nearbyUsersService;
        console.log('BLE 서비스 초기화 중...');

        // 광고 중지 (이미 광고 중이라면)
        try {
          await bleServiceRef.current.stopAdvertising();
          console.log('광고 중지됨');
        } catch (err) {
          console.log('광고 중지 시도 중 오류 (무시됨):', err.message);
        }

        // BLE 초기화
        const initResult = await bleServiceRef.current.initialize();
        setBluetoothReady(initResult);
        console.log(`BLE 초기화 ${initResult ? '성공' : '실패'}`);

        if (initResult) {
          // 초기화 성공 시 광고 시작
          try {
            await bleServiceRef.current.startAdvertising();
            console.log('광고 시작됨');
          } catch (err) {
            console.error('광고 시작 중 오류:', err);
          }

          // 스캔 시작
          await startScanning();
        } else {
          console.log('BLE 초기화 실패');
          setLoading(false);
        }
      } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        setUsers([]);
        setButtonVisible(false);
        setLoading(false);
      }
    };

    initialize();

    // 컴포넌트 언마운트 시
    return () => {
      if (bleServiceRef.current) {
        try {
          // 리소스 정리
          stopScanning();

          // 화면을 나갈 때는 광고 계속 유지
          console.log('컴포넌트 언마운트: 광고는 유지됨');
        } catch (e) {
          console.error('정리 중 오류:', e);
        }
      }
    };
  }, []);

  // 새로고침 버튼 핸들러
  const handleRefresh = async () => {
    if (isScanning) {
      return;
    }
    await startScanning();
  };

  // 기프티콘 목록 로드 함수
  const loadGiveAwayGifticons = async () => {
    setIsLoadingGifticons(true);
    try {
      const response = await mapGifticonService.getMapGifticons();
      if (response && response.gifticons) {
        setGiveAwayGifticons(response);
      } else {
        setGiveAwayGifticons({ gifticons: [], hasNextPage: false, nextPage: null });
      }
    } catch (error) {
      console.error('뿌리기용 기프티콘 목록 로드 실패:', error);
      setGiveAwayGifticons({ gifticons: [], hasNextPage: false, nextPage: null });
    } finally {
      setIsLoadingGifticons(false);
    }
  };

  // 선물 버튼 핸들러
  const handleButtonClick = async () => {
    setIsLoadingGifticons(true);
    try {
      await loadGiveAwayGifticons(); // 기프티콘 목록 로드
      setListVisible(true);
      setButtonVisible(false);
    } finally {
      setIsLoadingGifticons(false);
    }
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
    setButtonVisible(true);
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
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isScanning}
          style={styles.refreshButton}
        >
          <Icon
            name="refresh"
            type="material"
            size={24}
            color={isScanning ? theme.colors.gray : theme.colors.black}
          />
        </TouchableOpacity>
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
            // 로딩 중일 때 Lottie 애니메이션 표시
            <View style={styles.loadingOverlay}>
              <LottieView
                source={require('../../assets/lottie/search_users.json')}
                autoPlay
                loop
                style={{
                  width: secondCircleDiameter,
                  height: secondCircleDiameter,
                }}
              />
            </View>
          ) : users.length > 0 ? (
            // 사용자가 있을 때 UI
            users.map((user, index) => {
              const position = userPositions[index];
              const baseSize = 80;
              const adjustedSize = baseSize * position.scale;

              // 수신자 효과 애니메이션 적용
              const pulseScale =
                giftSentUserId === user.uuid
                  ? receivedUserAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.3, 1],
                    })
                  : 1;

              const glowOpacity =
                giftSentUserId === user.uuid
                  ? receivedUserAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.8],
                    })
                  : 0;

              return (
                <Animated.View
                  key={`user-${user.uuid}`}
                  style={[
                    styles.userContainer,
                    {
                      left: position.x - adjustedSize / 2,
                      top: position.y - adjustedSize / 2,
                      width: adjustedSize,
                      opacity: position.opacity,
                      zIndex: 10 - position.distanceIndex,
                      transform: [{ scale: giftSentUserId === user.uuid ? pulseScale : 1 }],
                    },
                    // 선물을 받은 사용자에게 효과 추가
                    giftSentUserId === user.uuid && styles.receivedGift,
                  ]}
                >
                  {/* 선물 받은 사용자 주변 효과 */}
                  {giftSentUserId === user.uuid && (
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
            <NoUsersScreen onRefresh={handleRefresh} />
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
            {isLoadingGifticons ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary || '#007bff'}
                style={{ flex: 1, justifyContent: 'center' }}
              />
            ) : (
              <GiveAwayGifticonList
                gifticons={giveAwayGifticons.gifticons}
                onSelectGifticon={handleGifticonSelect}
              />
            )}
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
    height: height * 0.4,
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

  refreshButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
});

export default GiveAwayScreen;
