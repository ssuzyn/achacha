import messaging from '@react-native-firebase/messaging';
import notificationService from '../api/notificationService';
import NavigationService from '../navigation/NavigationService';
import { Platform, AppState } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// 참조 타입 상수
const REFERENCE_TYPES = {
  GIFTICON: 'gifticon',
  SHAREBOX: 'sharebox',
};

// 알림 타입에 따른 처리 방식 정의
const NOTIFICATION_HANDLERS = {
  // 기프티콘 관련 알림 처리 함수
  handleGifticonNotification: async referenceEntityId => {
    try {
      // 기프티콘 상세 정보를 먼저 가져와서 타입 확인
      const gifticonDetail = await notificationService.getGifticonDetail(referenceEntityId);

      // 기프티콘 타입에 따라 적절한 상세 화면으로 이동
      if (gifticonDetail.gifticonType === 'AMOUNT') {
        // 금액형 기프티콘
        NavigationService.navigate('DetailAmount', {
          gifticonId: referenceEntityId,
          scope: 'MY_BOX', // 기본값은 MY_BOX로 설정
        });
      } else {
        // 상품형 기프티콘 (기본값)
        NavigationService.navigate('DetailProduct', {
          gifticonId: referenceEntityId,
          scope: 'MY_BOX', // 기본값은 MY_BOX로 설정
        });
      }
    } catch (error) {
      console.error('기프티콘 알림 처리 중 오류 발생:', error);
      // 오류 발생 시 기본 화면으로 이동
      NavigationService.navigate('Main', { screen: 'TabGifticonManage' });
    }
  },

  // 쉐어박스 관련 알림 처리 함수
  handleShareboxNotification: async (referenceEntityId, notificationType) => {
    try {
      // 쉐어박스 기프티콘 목록 화면으로 이동
      NavigationService.navigate('BoxList', {
        shareBoxId: referenceEntityId,
        initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
      });
    } catch (error) {
      console.error('쉐어박스 알림 처리 중 오류 발생:', error);
      // 오류 발생 시 쉐어박스 탭으로 이동
      NavigationService.navigate('Main', { screen: 'TabSharebox' });
    }
  },
};

/**
 * FCM 알림 데이터로부터 화면 이동에 필요한 정보 추출
 */
export const extractNavigationInfo = message => {
  // 메시지 형식에 따라 데이터 추출 방식 달라짐
  const data = message.data || {};
  const notification = message.notification || {};

  // FCM 페이로드에서 필요한 데이터 추출
  const notificationType = data.notificationType || data.type;

  // referenceEntityType과 referenceEntityId를 직접 FCM 데이터에서 추출
  // 서로 다른 필드 이름으로 전송될 수 있는 경우를 모두 처리
  const referenceEntityType = data.referenceEntityType || data.type;

  // referenceEntityId, gifticonId, shareboxId 등 다양한 필드명 처리
  // ID가 숫자 타입으로 온 경우 문자열로 변환
  const entityId = data.referenceEntityId || data.id || data.gifticonId || data.shareboxId;
  const referenceEntityId = entityId ? String(entityId) : null;

  console.log('추출된 알림 데이터:', {
    notificationType,
    referenceEntityType,
    referenceEntityId,
    rawData: data,
  });

  return {
    notificationType,
    referenceEntityType,
    referenceEntityId,
    title: notification.title || data.title,
    body: notification.body || data.body,
  };
};

/**
 * 추출한 정보를 바탕으로 적절한 화면으로 이동
 */
export const handleNotificationNavigation = async navigationInfo => {
  const { notificationType, referenceEntityType, referenceEntityId } = navigationInfo;

  console.log('화면 이동 처리 시작:', navigationInfo);

  if (!referenceEntityId) {
    console.log('참조 ID가 없습니다:', navigationInfo);
    // 기본 화면으로 이동
    NavigationService.navigate('Main');
    return;
  }

  // 쉐어박스 삭제 알림은 메인 화면으로 이동
  if (notificationType === 'SHAREBOX_DELETED') {
    console.log('쉐어박스 삭제 알림: 메인 화면으로 이동');
    NavigationService.navigate('Main');
    return;
  }

  // referenceEntityType이 직접 지정된 경우 우선적으로 처리
  if (referenceEntityType === REFERENCE_TYPES.GIFTICON) {
    console.log('기프티콘 타입으로 직접 이동');
    await NOTIFICATION_HANDLERS.handleGifticonNotification(referenceEntityId);
    return;
  } else if (referenceEntityType === REFERENCE_TYPES.SHAREBOX) {
    console.log('쉐어박스 타입으로 직접 이동');
    await NOTIFICATION_HANDLERS.handleShareboxNotification(referenceEntityId, notificationType);
    return;
  }

  // 이전 방식: 알림 타입에 따른 분기 처리
  if (
    ['EXPIRY_DATE', 'USAGE_COMPLETE', 'RECEIVE_GIFTICON', 'LOCATION_BASED'].includes(
      notificationType
    )
  ) {
    // 기프티콘 관련 알림
    await NOTIFICATION_HANDLERS.handleGifticonNotification(referenceEntityId);
  } else if (
    ['SHAREBOX_GIFTICON', 'SHAREBOX_USAGE_COMPLETE', 'SHAREBOX_MEMBER_JOIN'].includes(
      notificationType
    )
  ) {
    // 쉐어박스 관련 알림
    await NOTIFICATION_HANDLERS.handleShareboxNotification(referenceEntityId, notificationType);
  } else {
    console.log('처리되지 않은 알림 타입:', notificationType);
    // 기본 동작: 메인 화면으로 이동
    NavigationService.navigate('Main');
  }
};

/**
 * 앱 상태에 따른 알림 처리
 */
export const handleForegroundNotification = message => {
  // 앱이 활성화 상태일 때 로컬 푸시 알림 표시
  const { title, body } = extractNavigationInfo(message);

  // iOS와 Android의 로컬 푸시 알림 처리
  if (Platform.OS === 'ios') {
    PushNotificationIOS.addNotificationRequest({
      id: message.messageId || String(Date.now()),
      title,
      body,
      userInfo: message.data,
    });
  } else {
    PushNotification.localNotification({
      channelId: 'default-channel',
      title,
      message: body,
      data: message.data,
    });
  }
};

/**
 * FCM 초기화 및 이벤트 리스너 설정
 */
export const initializeNotifications = async () => {
  try {
    // iOS에서는 권한 요청 필요
    if (Platform.OS === 'ios') {
      await messaging().requestPermission();
    }

    // 포그라운드 상태에서 메시지 수신 시 이벤트 리스너
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('포그라운드 메시지 수신:', remoteMessage);
      handleForegroundNotification(remoteMessage);
    });

    // 백그라운드에서 알림 클릭 시 이벤트 핸들링
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('백그라운드에서 알림 클릭:', remoteMessage);
      const navigationInfo = extractNavigationInfo(remoteMessage);
      await handleNotificationNavigation(navigationInfo);
    });

    // 앱이 종료된 상태에서 알림 클릭으로 실행된 경우
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage) {
      console.log('종료 상태에서 알림 클릭으로 실행:', initialMessage);
      // 앱 초기화가 완료된 후에 처리하기 위해 약간의 지연 추가
      setTimeout(async () => {
        const navigationInfo = extractNavigationInfo(initialMessage);
        await handleNotificationNavigation(navigationInfo);
      }, 1000);
    }

    // FCM 토큰 변경 시 처리 (필요한 경우 서버에 토큰 업데이트)
    messaging().onTokenRefresh(token => {
      console.log('FCM 토큰 갱신:', token);
      // 필요한 경우 서버에 새 토큰 등록
      updateFcmToken(token);
    });

    // 초기 토큰 획득 및 저장
    const token = await messaging().getToken();
    console.log('FCM 토큰:', token);
    updateFcmToken(token);

    // Android용 채널 생성
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel',
          channelName: '기본 알림',
          channelDescription: '앱의 기본 알림 채널',
          importance: 4,
          vibrate: true,
        },
        created => console.log(`알림 채널 생성 ${created ? '성공' : '실패'}`)
      );
    }

    return unsubscribeForeground;
  } catch (error) {
    console.error('FCM 초기화 실패:', error);
    return null;
  }
};

/**
 * FCM 토큰을 서버에 업데이트
 */
const updateFcmToken = async token => {
  try {
    // API를 통해 서버에 토큰 업데이트 요청
    await notificationService.updateFcmToken(token);
    console.log('FCM 토큰 서버 업데이트 성공');
  } catch (error) {
    console.error('FCM 토큰 서버 업데이트 실패:', error);
  }
};

/**
 * 로컬 푸시 알림 설정
 */
export const setupLocalNotifications = () => {
  PushNotification.configure({
    // 알림 클릭 시 호출되는 함수
    onNotification: function (notification) {
      console.log('로컬 알림 클릭:', notification);

      // 데이터 추출
      const data = notification.data || {};
      const navigationInfo = {
        notificationType: data.notificationType,
        referenceEntityType: data.referenceEntityType,
        referenceEntityId: data.referenceEntityId,
        title: notification.title,
        body: notification.message,
      };

      // 화면 이동 처리
      handleNotificationNavigation(navigationInfo);

      // iOS 필수: 완료 콜백
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },

    // 사용자가 알림 권한을 거부한 경우
    onRegistrationError: function (err) {
      console.error('알림 등록 오류:', err.message);
    },

    // Android 설정
    largeIcon: 'ic_launcher',
    smallIcon: 'ic_notification',

    // iOS 설정
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    popInitialNotification: true,
    requestPermissions: true,
  });
};

export default {
  initializeNotifications,
  setupLocalNotifications,
  handleNotificationNavigation,
  extractNavigationInfo,
};
