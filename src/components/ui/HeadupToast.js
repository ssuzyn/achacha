import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

// NotificationScreen.js에서 사용하는 것과 동일한 아이콘 매핑
const NOTIFICATION_ICONS = {
  EXPIRY_DATE: 'calendar-month', // 유효기간 만료 알림
  LOCATION_BASED: 'share-location', // 주변 매장 알림
  USAGE_COMPLETE: 'schedule', // 사용완료 여부 알림
  RECEIVE_GIFTICON: 'tap-and-play', // 기프티콘 뿌리기 수신
  SHAREBOX_GIFTICON: 'inventory-2', // 쉐어박스 기프티콘 등록
  SHAREBOX_USAGE_COMPLETE: 'inventory-2', // 쉐어박스 기프티콘 사용
  SHAREBOX_MEMBER_JOIN: 'inventory-2', // 쉐어박스 멤버 참여
  SHAREBOX_DELETED: 'inventory-2', // 쉐어박스 그룹 삭제
  // 기본 타입도 추가
  SUCCESS: 'check-circle',
  ERROR: 'error',
  INFO: 'info',
};

/**
 * 상단 헤드업 스타일 토스트 컴포넌트
 */
const HeadupToast = props => {
  // 기본 props 및 확장 props 추출
  const { text1, text2, onPress, onClose, props: customProps = {} } = props;

  // 알림 타입 및 아이콘 결정
  const type = customProps.type || 'default';
  const iconColor = getIconColor(type);
  const iconName = getIconName(type);

  // 제목과 메시지 (커스텀 props 또는 기본 props 사용)
  const title = customProps.title || text1 || '';
  const message = customProps.message || text2 || '';

  // 클릭 이벤트 핸들러
  const handlePress = () => {
    if (customProps.onPress) {
      customProps.onPress();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} activeOpacity={0.9} onPress={handlePress}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Icon name={iconName} type="material" size={22} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}

          {message ? (
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" type="material" size={18} color="#888" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

// 알림 타입에 따른 아이콘 선택 (NotificationScreen.js와 동일하게)
const getIconName = type => {
  // 일반 타입 (success, error, info) 처리
  if (type === 'success') return NOTIFICATION_ICONS.SUCCESS;
  if (type === 'error') return NOTIFICATION_ICONS.ERROR;
  if (type === 'info') return NOTIFICATION_ICONS.INFO;

  // 알림 타입이 NOTIFICATION_ICONS에 있는 경우 매핑된 아이콘 반환
  if (NOTIFICATION_ICONS[type]) {
    return NOTIFICATION_ICONS[type];
  }

  // 기본 아이콘
  return 'notifications';
};

// 알림 타입에 따른 색상 선택
const getIconColor = type => {
  switch (type) {
    case 'success':
    case 'SUCCESS':
    case 'LOCATION_BASED':
      return '#8CDA8F'; // 녹색

    case 'error':
    case 'ERROR':
    case 'EXPIRY_DATE':
      return '#EF9696'; // 빨간색

    case 'USAGE_COMPLETE':
      return '#6BB2EA'; // 파란색

    case 'info':
    case 'INFO':
    case 'RECEIVE_GIFTICON':
      return '#D095EE'; // 보라색

    case 'SHAREBOX_GIFTICON':
    case 'SHAREBOX_USAGE_COMPLETE':
    case 'SHAREBOX_MEMBER_JOIN':
    case 'SHAREBOX_DELETED':
      return '#F1A9D5'; // 분홍색

    default:
      return '#4B9CFF'; // 기본 파란색
  }
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    paddingRight: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#666666',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeadupToast;
