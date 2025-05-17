import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../api/config';

// 알림 타입 상수
export const NOTIFICATION_TYPES = {
  LOCATION_BASED: 'LOCATION_BASED', // 주변 매장 알림
  EXPIRY_DATE: 'EXPIRY_DATE', // 유효기간 만료 알림
  RECEIVE_GIFTICON: 'RECEIVE_GIFTICON', // 기프티콘 뿌리기 알림
  USAGE_COMPLETE: 'USAGE_COMPLETE', // 사용완료 여부 알림
  SHAREBOX_GIFTICON: 'SHAREBOX_GIFTICON', // 쉐어박스 기프티콘 등록
  SHAREBOX_USAGE_COMPLETE: 'SHAREBOX_USAGE_COMPLETE', // 쉐어박스 기프티콘 사용
  SHAREBOX_MEMBER_JOIN: 'SHAREBOX_MEMBER_JOIN', // 쉐어박스 멤버 참여
  SHAREBOX_DELETED: 'SHAREBOX_DELETED', // 쉐어박스 그룹 삭제
};

// 알림 타입별 아이콘 매핑 (Android 전용)
export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.LOCATION_BASED]: 'share-location', // 주변 매장 알림
  [NOTIFICATION_TYPES.EXPIRY_DATE]: 'calendar-month', // 유효기간 만료 알림
  [NOTIFICATION_TYPES.RECEIVE_GIFTICON]: 'tap-and-play', // 기프티콘 뿌리기 알림
  [NOTIFICATION_TYPES.USAGE_COMPLETE]: 'schedule', // 사용완료 여부 알림
  [NOTIFICATION_TYPES.SHAREBOX_GIFTICON]: 'inventory-2', // 쉐어박스 기프티콘 등록
  [NOTIFICATION_TYPES.SHAREBOX_USAGE_COMPLETE]: 'inventory-2', // 쉐어박스 기프티콘 사용
  [NOTIFICATION_TYPES.SHAREBOX_MEMBER_JOIN]: 'inventory-2', // 쉐어박스 멤버 참여
  [NOTIFICATION_TYPES.SHAREBOX_DELETED]: 'inventory-2', // 쉐어박스 그룹 삭제
};

// FCM 토큰을 서버에 저장하는 함수
const saveFcmTokenToServer = async token => {
  try {
    // 로그인 상태인지 확인
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      // 참고: 로그인 시 FCM 토큰이 이미 전송되므로 '/api/users/fcm-token' 엔드포인트는 사용하지 않음
      // 토큰 갱신 시에만 별도로 저장하도록 로그만 남깁니다
      console.log('알림 FCM 토큰 준비 완료:', token);
      // 토큰 갱신 시 처리 로직은 setupTokenRefresh에서 처리
    } else {
      console.log('로그인 상태가 아니므로 FCM 토큰 저장은 로그인 시 처리됩니다.');
    }
    return true;
  } catch (error) {
    console.error('알림 FCM 토큰 처리 실패:', error);
    return false;
  }
};

// 알림 권한 요청
export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('알림 푸시 권한 허용:', authStatus);
    await getFcmToken();
    return true;
  }

  console.log('푸시 권한 거부됨');
  return false;
};

// 디바이스 토큰 얻기
export const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('알림 FCM 토큰:', token);
    return token;
  } catch (error) {
    console.error('FCM 토큰 획득 실패:', error);
    return null;
  }
};

// 포그라운드 메시지 수신 처리
// 사용자가 현재 앱을 보고 있는 상태
// 앱에서 직접 알림 UI 처리 필요 (onMessage)
export const handleForegroundMessage = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('포그라운드 메시지 수신:', remoteMessage);

    // 알림 타입에 따른 특별 처리가 필요하면 여기서 구현
    const notificationType = remoteMessage.data?.type;

    Alert.alert(
      remoteMessage.notification?.title || '알림',
      remoteMessage.notification?.body || '새로운 알림이 도착했습니다'
    );
  });

  return unsubscribe;
};

// 백그라운드 & 종료 상태 메시지 처리 설정
// 백그라운드 - 앱이 켜져 있지만 화면에 없고, 다른 앱이 보임
// 앱이 알림 클릭 시 특정 화면 이동 가능
// 종료 상태 - 앱이 완전히 꺼져 있음(프로세스 없음)
// 앱 실행 시 알림 데이터 확인 가능
export const setupBackgroundHandler = () => {
  // 앱이 백그라운드에 있을 때 FCM 메시지 처리
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('백그라운드 메시지 처리:', remoteMessage);
    // 백그라운드에서는 자동으로 시스템 알림이 표시됨
  });
};

// 알림 클릭 시 처리
export const handleNotificationOpen = navigation => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('백그라운드 상태에서 알림 클릭:', remoteMessage);

    // 알림 타입에 따라 다른 화면으로 이동
    handleNavigationByType(navigation, remoteMessage);
  });

  // 앱이 종료된 상태에서 알림 클릭으로 열린 경우
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('종료 상태에서 알림 클릭으로 앱 실행:', remoteMessage);

        // 알림 타입에 따라 다른 화면으로 이동
        handleNavigationByType(navigation, remoteMessage);
      }
    });
};

// 알림 타입에 따른 화면 이동 처리
const handleNavigationByType = (navigation, remoteMessage) => {
  if (!navigation || !remoteMessage) return;

  const { data } = remoteMessage;
  const notificationType = data?.type;

  // 특정 화면으로 이동이 필요한 경우
  if (data?.screen) {
    navigation.navigate(data.screen, data?.params);
    return;
  }

  // 알림 타입에 따른 기본 화면 이동
  switch (notificationType) {
    case NOTIFICATION_TYPES.LOCATION_BASED:
      // 주변 매장 알림 - 위치 기반 페이지로 이동
      navigation.navigate('Map');
      break;
    case NOTIFICATION_TYPES.EXPIRY_DATE:
      // 유효기간 만료 알림 - 기프티콘 페이지로 이동
      navigation.navigate('GifticonList');
      break;
    case NOTIFICATION_TYPES.RECEIVE_GIFTICON:
      // 기프티콘 뿌리기 알림 - 받은 기프티콘 페이지로 이동
      navigation.navigate('GifticonList');
      break;
    case NOTIFICATION_TYPES.USAGE_COMPLETE:
      // 사용완료 여부 알림 - 상세 페이지로 이동
      if (data?.gifticonId) {
        navigation.navigate('GifticonDetail', { id: data.gifticonId });
      }
      break;
    case NOTIFICATION_TYPES.SHAREBOX_GIFTICON:
    case NOTIFICATION_TYPES.SHAREBOX_USAGE_COMPLETE:
    case NOTIFICATION_TYPES.SHAREBOX_MEMBER_JOIN:
    case NOTIFICATION_TYPES.SHAREBOX_DELETED:
      // 쉐어박스 관련 알림 - 쉐어박스 페이지로 이동
      if (data?.shareboxId) {
        navigation.navigate('ShareboxDetail', { id: data.shareboxId });
      } else {
        navigation.navigate('Sharebox');
      }
      break;
    default:
      // 기본 페이지로 이동
      navigation.navigate('Home');
  }
};

// 토큰 갱신 감지 및 서버 업데이트
export const setupTokenRefresh = () => {
  return messaging().onTokenRefresh(async token => {
    console.log('FCM 토큰 갱신:', token);
    try {
      // 로그인 상태인지 확인
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        // 토큰 갱신 시 서버에 전송
        await apiClient.post(API_CONFIG.ENDPOINTS.FCM_TOKEN_UPDATE, { fcmToken: token });
        console.log('갱신된 FCM 토큰이 서버에 저장되었습니다:', token);
      } else {
        console.log('로그인 상태가 아니므로 FCM 토큰 갱신은 저장되지 않습니다.');
      }
    } catch (error) {
      console.error('FCM 토큰 갱신 서버 저장 실패:', error);
    }
  });
};
