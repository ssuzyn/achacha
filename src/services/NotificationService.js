import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

// FCM 토큰을 서버에 저장하는 함수 (실제 API 호출 필요)
const saveFcmTokenToServer = async token => {
  try {
    // 서버 API 엔드포인트에 토큰 전송 구현
    // 예: await api.post('/users/fcm-token', { token });
    console.log('알림 FCM 토큰이 서버에 저장되었습니다:', token);
    return true;
  } catch (error) {
    console.error('알림 FCM 토큰 서버 저장 실패:', error);
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

// 디바이스 토큰 얻기 및 서버에 저장
export const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('알림 FCM 토큰:', token);

    // 토큰을 서버에 저장
    await saveFcmTokenToServer(token);

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

    // 특정 화면으로 이동이 필요한 경우
    if (remoteMessage.data?.screen) {
      navigation.navigate(remoteMessage.data.screen, remoteMessage.data?.params);
    }
  });

  // 앱이 종료된 상태에서 알림 클릭으로 열린 경우
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('종료 상태에서 알림 클릭으로 앱 실행:', remoteMessage);

        // 특정 화면으로 이동이 필요한 경우
        if (remoteMessage.data?.screen && navigation) {
          navigation.navigate(remoteMessage.data.screen, remoteMessage.data?.params);
        }
      }
    });
};

// 토큰 갱신 감지 및 서버 업데이트
export const setupTokenRefresh = () => {
  return messaging().onTokenRefresh(async token => {
    console.log('FCM 토큰 갱신:', token);
    await saveFcmTokenToServer(token);
  });
};
