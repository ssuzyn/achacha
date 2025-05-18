import Toast from 'react-native-toast-message';
import React from 'react';
import ToastNotification from '../components/ui/ToastNotification';
import NavigationService from '../navigation/NavigationService';
import notificationService from '../api/notificationService';

// 참조 타입 상수
const REFERENCE_TYPES = {
  GIFTICON: 'gifticon',
  SHAREBOX: 'sharebox',
};

/**
 * 커스텀 토스트 설정
 */
export const toastConfig = {
  notificationToast: ({ props, hide }) => {
    const { notificationType, title, message, referenceEntityType, referenceEntityId } = props;

    // 알림 클릭 핸들러
    const handleNotificationPress = async () => {
      if (!referenceEntityId) {
        console.log('참조 ID가 없습니다:', props);
        return;
      }

      try {
        // 알림 닫기
        Toast.hide();

        // 기프티콘 관련 알림 처리
        if (
          ['EXPIRY_DATE', 'USAGE_COMPLETE', 'RECEIVE_GIFTICON', 'LOCATION_BASED'].includes(
            notificationType
          ) &&
          referenceEntityType === REFERENCE_TYPES.GIFTICON
        ) {
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
        }
        // 쉐어박스 관련 알림 처리
        else if (
          ['SHAREBOX_GIFTICON', 'SHAREBOX_USAGE_COMPLETE', 'SHAREBOX_MEMBER_JOIN'].includes(
            notificationType
          ) &&
          referenceEntityType === REFERENCE_TYPES.SHAREBOX
        ) {
          // 쉐어박스 기프티콘 목록 화면으로 이동
          NavigationService.navigate('BoxList', {
            shareBoxId: referenceEntityId,
            initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
          });
        } else {
          console.log('처리되지 않은 알림 타입:', notificationType);
        }
      } catch (error) {
        console.error('알림 처리 중 오류 발생:', error);
      }
    };

    return (
      <ToastNotification
        notificationType={notificationType}
        title={title}
        message={message}
        onPress={handleNotificationPress}
        onClose={() => Toast.hide()}
        hide={hide}
      />
    );
  },
};

/**
 * 푸시 알림을 토스트 메시지로 표시
 * @param {Object} message - FCM 메시지 객체
 */
export const showNotificationToast = (message) => {
  const { title, body } = message.notification || {};
  const data = message.data || {};

  // 알림 데이터 보강
  const notificationData = {
    notificationType: data.notificationType || data.type,
    referenceEntityType: data.referenceEntityType || data.type,
    referenceEntityId: data.referenceEntityId || data.id || data.gifticonId || data.shareboxId,
  };

  // 토스트 메시지 표시
  Toast.show({
    type: 'notificationToast',
    props: {
      notificationType: notificationData.notificationType,
      title: title || '새로운 알림',
      message: body || '새로운 알림이 도착했습니다.',
      referenceEntityType: notificationData.referenceEntityType,
      referenceEntityId: notificationData.referenceEntityId,
    },
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
  });
};

export default {
  toastConfig,
  showNotificationToast,
}; 