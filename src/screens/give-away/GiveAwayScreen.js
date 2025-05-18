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
import { giveAwayService } from '../../services/giveAwayService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
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
  const [userPositions, setUserPositions] = useState([]);
  const [userDataReady, setUserDataReady] = useState(false);
  const userPositionsRef = useRef([]);
  const [listVisible, setListVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [centerButtonVisible, setCenterButtonVisible] = useState(false);
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
  const buttonPositionX = useRef(new Animated.Value(0)).current;
  const buttonPositionY = useRef(new Animated.Value(0)).current;
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

  // 여러 거리에 사용자를 배치하여 원근감 부여 (랜덤성 추가)
  const calculateUserPositions = users => {
    if (userPositionsRef.current.length === users.length) {
      return userPositionsRef.current;
    }

    const positions = [];
    // 랜덤 시작 각도 추가
    const startAngle = Math.random() * Math.PI * 2;
    const angleStep = (2 * Math.PI) / users.length;

    for (let i = 0; i < users.length; i++) {
      // 각 사용자마다 랜덤 거리 인덱스 할당
      const distanceIndex = Math.floor(Math.random() * 3);

      let userRadius;
      // 각 거리에 약간의 랜덤성 추가
      const radiusVariation = Math.random() * 0.2 - 0.1; // -10% ~ +10% 변동

      if (distanceIndex === 0) {
        userRadius = (smallestRadius + circleSpacing * 0.7) * (1 + radiusVariation);
      } else if (distanceIndex === 1) {
        userRadius = (smallestRadius + circleSpacing * 1.5) * (1 + radiusVariation);
      } else {
        userRadius = (smallestRadius + circleSpacing * 2.2) * (1 + radiusVariation);
      }

      // 각도에 약간의 랜덤성 추가
      const angleVariation = (Math.random() - 0.5) * (Math.PI / 12); // +/- 15도 랜덤 변동
      const angle = startAngle + angleStep * i + angleVariation;

      const x = centerX + userRadius * Math.cos(angle);
      const y = centerY + userRadius * Math.sin(angle);
      const scale = 1 - distanceIndex * 0.15;
      const opacity = 1 - distanceIndex * 0.1;

      positions.push({ x, y, scale, opacity, distanceIndex });
    }

    userPositionsRef.current = positions;
    return positions;
  };

  // users 상태가 변경될 때마다 positions 재계산
  // 이모지 변환은 onScanComplete 내에서 직접 처리하고, 여기서는 위치만 계산
  useEffect(() => {
    console.log('[상태 변경] users 업데이트됨, 길이:', users.length);

    if (users.length > 0) {
      // 위치 계산
      const positions = calculateUserPositions(users);
      userPositionsRef.current = positions;
      setUserPositions(positions);

      // 사용자 데이터 준비 완료 상태로 설정
      setUserDataReady(true);

      console.log('[상태 변경] positions 업데이트됨, 길이:', positions.length);
    } else {
      // 사용자가 없을 때 초기화
      setUserPositions([]);
      userPositionsRef.current = [];
      setUserDataReady(false);
      console.log('[상태 변경] 사용자 없음, positions 초기화');
    }
  }, [users]);

  // PanResponder 수정
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        console.log(
          '드래그 시작, 사용자 수:',
          users.length,
          '위치 수:',
          userPositions.length,
          '데이터 준비됨:',
          userDataReady
        );
        Animated.spring(buttonScaleAnim, {
          toValue: 1.2,
          friction: 2,
          tension: 80,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        buttonPositionX.setValue(gestureState.dx * 1.2);
        buttonPositionY.setValue(gestureState.dy * 1.2);
      },
      onPanResponderRelease: (e, gesture) => {
        console.log(
          '드래그 종료, 사용자 수:',
          users.length,
          '위치 수:',
          userPositions.length,
          '데이터 준비됨:',
          userDataReady
        );

        const dragDistance = Math.sqrt(Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2));

        if (dragDistance < 50) {
          console.log('드래그 거리가 너무 짧음, 리셋');
          resetButtonPosition();
          return;
        }

        if (users.length > 0 && userPositions.length === users.length && userDataReady) {
          // 사용자와 위치 정보가 모두 있는 경우에만 진행
          const randomIndex = Math.floor(Math.random() * users.length);
          if (randomIndex >= 0 && randomIndex < userPositions.length) {
            const selectedUser = {
              ...users[randomIndex],
              position: userPositions[randomIndex],
            };

            console.log(
              '선택된 사용자:',
              selectedUser.name,
              'uuid:',
              selectedUser.uuid,
              'position:',
              selectedUser.position
            );
            setTimeout(() => {
              sendGifticonToUser(selectedUser);
            }, 100);
          } else {
            console.log('유효하지 않은 인덱스:', randomIndex, '유저 수:', users.length);
            Alert.alert('알림', '사용자 선택 중 오류가 발생했습니다. 다시 시도해주세요.');
            resetButtonPosition();
          }
        } else {
          console.log('사용자 정보 문제:', {
            usersLength: users.length,
            positionsLength: userPositions.length,
            dataReady: userDataReady,
          });
          Alert.alert(
            '알림',
            '주변에 선물을 받을 수 있는 사용자가 없거나 데이터가 준비되지 않았습니다.'
          );
          resetButtonPosition();
        }
      },
    })
  ).current;

  // 버튼 위치 초기화
  const resetButtonPosition = () => {
    Animated.parallel([
      Animated.spring(buttonPositionX, {
        toValue: 0,
        friction: 3,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(buttonPositionY, {
        toValue: 0,
        friction: 3,
        tension: 50,
        useNativeDriver: true,
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
    if (!selectedGifticon || !user || !user.position) {
      console.error('전송 실패: 필요한 정보 누락', {
        selectedGifticon: !!selectedGifticon,
        user: !!user,
        userPosition: user ? !!user.position : false,
      });
      Alert.alert('오류', '필요한 정보가 누락되었습니다. 다시 시도해주세요.');
      resetButtonPosition();
      return;
    }

    console.log('전송 시작 - 기본 정보:', {
      gifticonName: selectedGifticon.gifticonName || '기프티콘',
      gifticonId: selectedGifticon.gifticonId || selectedGifticon.id,
      userName: user.name,
      uuid: user.uuid,
      bleToken: user.bleToken,
    });

    setGiftSentUserId(user.uuid);
    setIsTransferring(true);

    // 버튼을 사용자 쪽으로 애니메이션
    Animated.parallel([
      Animated.timing(buttonPositionX, {
        toValue: user.position.x - width / 2,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(buttonPositionY, {
        toValue: user.position.y - height / 2,
        duration: 250,
        useNativeDriver: true,
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

        // API 호출을 위한 파라미터 준비
        const gifticonIdToUse = selectedGifticon.gifticonId || selectedGifticon.id;
        if (!gifticonIdToUse) {
          throw new Error('기프티콘 ID가 없습니다.');
        }

        if (!user.bleToken) {
          throw new Error('사용자의 BLE 토큰이 없습니다.');
        }

        console.log('API 호출 직전:', {
          gifticonId: gifticonIdToUse,
          bleToken: user.bleToken,
          apiPath: `/api/gifticons/${gifticonIdToUse}/give-away`,
        });

        // API 호출 (bleToken을 uuids 배열로 전달)
        const response = await giveAwayService.giveAwayGifticon(
          gifticonIdToUse,
          [user.bleToken] // bleToken을 uuids 배열로 전달
        );
        console.log('API 응답 성공:', response);

        // 짧은 딜레이 후 알림 표시
        setTimeout(() => {
          Alert.alert(
            '기프티콘 뿌리기 완료',
            `${user.name}님에게 ${selectedGifticon.gifticonName || '기프티콘'}을(를) 뿌렸습니다!`,
            [
              {
                text: '확인',
                onPress: () => {
                  resetAfterSend();
                },
              },
            ]
          );
        }, 800);
      } catch (error) {
        console.error('기프티콘 전송 중 에러:', {
          message: error.message,
          stack: error.stack,
          request: error.request,
          response: error.response,
          config: error.config,
        });

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
    buttonPositionX.setValue(0);
    buttonPositionY.setValue(0);
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

  // 이모지 숫자 인덱스를 이모지 객체로 변환하는 함수
  const getEmojiFromIndex = index => {
    const emojiOptions = [emoji1, emoji2, emoji3, emoji4, emoji5];
    if (typeof index === 'number' && index >= 0) {
      return emojiOptions[index % emojiOptions.length];
    }
    return emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
  };

  // 스캔 완료 콜백
  const onScanComplete = allUsers => {
    console.log('[BLE 스캔] 스캔 완료, 발견된 사용자 수:', allUsers.length);

    if (allUsers && allUsers.length > 0) {
      const mappedUsers = allUsers
        .map((user, index) => {
          // 이모지를 숫자 인덱스로 받았다면, 여기서 바로 이모지 객체로 변환
          let userEmoji;
          if (typeof user.emoji === 'number') {
            userEmoji = getEmojiFromIndex(user.emoji);
          } else {
            // 랜덤 이모지 할당
            const randomEmojiIndex = Math.floor(Math.random() * 5);
            userEmoji = getEmojiFromIndex(randomEmojiIndex);
          }

          return {
            uuid: user.uuid || `user-${index}`,
            name: user.name || `사용자 ${index + 1}`,
            emoji: userEmoji, // 이미 객체로 변환된 이모지 사용
            deviceId: user.deviceId || `device-${index}`,
            bleToken: user.bleToken || `token-${index}`,
          };
        })
        .slice(0, 5);

      console.log('[BLE 스캔] 매핑된 사용자 목록 길이:', mappedUsers.length);

      // 상태 업데이트 (이모지는 이미 객체로 변환됨)
      setUsers(mappedUsers);
      setButtonVisible(mappedUsers.length > 0);
    } else {
      console.log('[BLE 스캔] 사용자가 없거나 스캔 결과가 undefined');
      setUsers([]);
      setUserDataReady(false);
      setButtonVisible(false);
    }
    setLoading(false);
    setIsScanning(false);
  };

  // BLE 스캔 시작 함수
  const startScanning = async () => {
    if (!bleServiceRef.current || isScanning) {
      console.log(
        '[BLE 스캔] 스캔 시작 불가:',
        !bleServiceRef.current ? 'BLE 서비스가 초기화되지 않음' : '이미 스캔 중'
      );
      setLoading(false);
      return;
    }

    try {
      setIsScanning(true);
      setLoading(true);
      console.log('[BLE 스캔] 스캔 시작 시간:', new Date().toISOString());

      // 발견된 사용자 정보 저장
      let discoveredUsers = [];

      // 사용자 발견 콜백
      const onUserFound = user => {
        if (user && user.uuid && !discoveredUsers.some(u => u.uuid === user.uuid)) {
          discoveredUsers.push(user);
          console.log('[BLE 스캔] 새 사용자 발견, 현재 총:', discoveredUsers.length);
        }
      };

      await bleServiceRef.current.startScan(onUserFound, onScanComplete);

      // 5초 후 자동으로 스캔 종료 (안전장치)
      setTimeout(() => {
        if (isScanning) {
          console.log('[BLE 스캔] 5초 타임아웃, 스캔 종료');
          stopScanning();
          if (loading) setLoading(false);

          // 결과가 없으면 빈 결과로 처리
          if (users.length === 0) {
            onScanComplete([]);
          }
        }
      }, 5000);
    } catch (error) {
      console.error('[BLE 스캔] 스캔 중 오류 발생:', error);
      setUsers([]);
      setUserPositions([]);
      userPositionsRef.current = [];
      setButtonVisible(false);
      setLoading(false);
      setIsScanning(false);
    }
  };

  // 스캔 중지 함수
  const stopScanning = async () => {
    if (!bleServiceRef.current) {
      console.log('[BLE 스캔] BLE 서비스가 초기화되지 않아 스캔 중지 불가');
      return;
    }

    try {
      console.log('[BLE 스캔] 스캔 중지 시도');
      await bleServiceRef.current.stopScan();
      console.log('[BLE 스캔] 스캔 중지 완료');
    } catch (error) {
      console.error('[BLE 스캔] 스캔 중지 중 오류 발생:', error.message);
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
          Alert.alert('알림', '블루투스 초기화에 실패했습니다. 블루투스 설정을 확인해주세요.');
        }
      } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        setUsers([]);
        setUserPositions([]);
        userPositionsRef.current = [];
        setButtonVisible(false);
        setLoading(false);
        Alert.alert('오류', '초기화 중 문제가 발생했습니다: ' + error.message);
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
    if (isScanning || loading) {
      console.log('이미 스캔 중이거나 로딩 중이라 새로고침 무시');
      return;
    }

    try {
      // 즉시 로딩 상태로 전환하고 현재 사용자 목록 초기화
      setLoading(true);
      setUsers([]);
      setUserPositions([]);
      setUserDataReady(false);
      userPositionsRef.current = [];

      // 이미 스캔 중이라면 먼저 중지
      if (isScanning) {
        await stopScanning();
      }

      // 스캔 시작
      await startScanning();
    } catch (error) {
      console.error('[새로고침] 오류 발생:', error);
      setLoading(false);
      setIsScanning(false);
      Alert.alert('새로고침 실패', '사용자 검색 중 오류가 발생했습니다.');
    }
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
      Alert.alert('오류', '기프티콘 목록을 불러오는 중 오류가 발생했습니다.');
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
    } catch (error) {
      console.error('기프티콘 목록 로드 중 오류:', error);
      Alert.alert('오류', '기프티콘 목록을 불러오는 중 문제가 발생했습니다.');
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
          style={[styles.refreshButton, isScanning && styles.refreshButtonSpinning]}
          disabled={isScanning || loading}
        >
          <Icon
            name="refresh"
            type="material"
            size={24}
            color={isScanning || loading ? theme.colors.gray : theme.colors.black}
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
          ) : userDataReady && users.length > 0 && userPositions.length === users.length ? (
            // 사용자 데이터가 완전히 준비되었을 때만 표시
            users.map((user, index) => {
              const position = userPositions[index];
              if (!position) return null;

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
                      source={user.emoji}
                      style={{
                        width: adjustedSize,
                        height: adjustedSize,
                        resizeMode: 'contain',
                      }}
                    />
                  </View>
                  <Text style={[styles.userName, { fontSize: 18 * position.scale }]}>
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
                    { translateX: buttonPositionX },
                    { translateY: buttonPositionY },
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
    marginBottom: 2,
  },
  emoji: {
    fontSize: 50,
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
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
    padding: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonSpinning: {
    opacity: 0.5,
  },
});

export default GiveAwayScreen;
