import Toast from 'react-native-toast-message';
import React from 'react';
import HeadupToast from '../components/ui/HeadupToast';
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
  // 성공 토스트
  success: props => <HeadupToast {...props} />,

  // 에러 토스트
  error: props => <HeadupToast {...props} />,

  // 정보 토스트
  info: props => <HeadupToast {...props} />,

  // 알림 토스트
  notificationToast: props => {
    const data = props.props || {};

    // 알림 클릭 핸들러
    const handleNotificationPress = async () => {
      try {
        // 알림 닫기
        Toast.hide();

        const { referenceEntityType, referenceEntityId, notificationType } = data;

        if (!referenceEntityId) {
          console.log('참조 ID가 없습니다:', data);
          return;
        }

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

    // HeadupToast에 전달할 props
    const propsWithHandler = {
      ...props,
      props: {
        ...data,
        type: data.notificationType,
        onPress: handleNotificationPress,
      },
    };

    return <HeadupToast {...propsWithHandler} />;
  },
};

/**
 * 푸시 알림을 토스트 메시지로 표시
 * @param {Object} message - FCM 메시지 객체
 */
export const showNotificationToast = message => {
  const { title, body } = message.notification || {};
  const data = message.data || {};

  // 알림 데이터 보강
  const notificationData = {
    notificationType: data.notificationType || data.type,
    referenceEntityType: data.referenceEntityType || data.type,
    referenceEntityId: data.referenceEntityId || data.id || data.gifticonId || data.shareboxId,
  };

  // 기존 알림이 있으면 모두 제거
  Toast.hide();

  // 토스트 메시지 표시
  Toast.show({
    type: 'notificationToast',
    position: 'top',
    props: {
      title: title || '새로운 알림',
      message: body || '새로운 알림이 도착했습니다.',
      notificationType: notificationData.notificationType,
      referenceEntityType: notificationData.referenceEntityType,
      referenceEntityId: notificationData.referenceEntityId,
    },
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 0,
    onShow: () => console.log('알림 토스트가 표시되었습니다.'),
    onHide: () => console.log('알림 토스트가 숨겨졌습니다.'),
  });
};

/**
 * 일반 토스트 메시지 표시
 * @param {string} type - 토스트 타입 (success, error, info)
 * @param {string} title - 토스트 제목
 * @param {string} message - 토스트 메시지
 */
export const showToast = (type, title, message) => {
  // 기존 토스트 모두 제거
  Toast.hide();

  // 토스트 표시
  Toast.show({
    type: type || 'info',
    position: 'top',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 0,
  });
};

export default {
  toastConfig,
  showNotificationToast,
  showToast,
};
