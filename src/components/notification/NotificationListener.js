import React, { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import toastService from '../../utils/toastService';

/**
 * 네이티브 모듈에서 FCM 메시지 이벤트를 수신하여 토스트 메시지로 표시하는 컴포넌트
 * App.js에 포함하여 사용
 */
const NotificationListener = () => {
  useEffect(() => {
    // Android 플랫폼에서만 처리
    if (Platform.OS === 'android') {
      // NativeModules에서 NotificationModule 확인
      const { NotificationModule } = NativeModules;

      if (NotificationModule) {
        console.log('[Native] NotificationModule이 등록되어 있습니다.');

        // 이벤트 이미터 생성
        const notificationEmitter = new NativeEventEmitter(NotificationModule);

        // FCM 메시지 수신 이벤트 리스너 등록
        const subscription = notificationEmitter.addListener(
          'fcmMessageReceived',
          remoteMessage => {
            console.log('[Native Event] FCM 메시지 수신:', remoteMessage);

            // 토스트 메시지로 알림 표시
            if (remoteMessage) {
              toastService.showNotificationToast(remoteMessage);
              console.log('[Native Event] FCM 메시지를 토스트로 표시했습니다.');
            }
          }
        );

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
          subscription.remove();
          console.log('[Native] FCM 메시지 수신 리스너가 제거되었습니다.');

          // 네이티브 모듈에도 알림
          if (NotificationModule && NotificationModule.removeListeners) {
            NotificationModule.removeListeners(1);
          }
        };
      } else {
        console.warn('[Native] NotificationModule을 찾을 수 없습니다.');
      }
    }

    // iOS나 다른 플랫폼에서는 아무 작업도 수행하지 않음
    return () => {};
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default NotificationListener;
