import React, { useEffect } from 'react';
import { StyleSheet, FlatList, StatusBar, View } from 'react-native';
import { Icon, useTheme } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useTabBar } from '../context/TabBarContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ListItem, Text } from '../components/ui';

// 알림 타입에 따른 아이콘 정의
const NOTIFICATION_ICONS = {
  EXPIRY: 'calendar-month', // 유효기간 만료 알림
  NEARBY: 'share-location', // 주변 매장 알림
  USED: 'schedule', // 사용완료 여부 알림
  SHARE: 'tap-and-play', // 기프티콘 나누기 알림
  SHAREBOX: 'inventory-2', // 쉐어박스 알림
};

// 더미 알림 데이터
const dummyNotifications = [
  {
    id: '1',
    type: 'EXPIRY',
    title: '유효기간 만료 알림',
    message: '아이스 카페 아메리카노 T 의 유효기간이 7일 남았습니다.',
    time: '3분 전',
  },
  {
    id: '2',
    type: 'NEARBY',
    title: '주변 매장 알림',
    message: '반경 150m 내에 기프티콘을 사용할 수 있는 스타벅스 매장이 있어요!',
    time: '3시간 전',
  },
  {
    id: '3',
    type: 'USED',
    title: '사용완료 여부 알림',
    message: '방금 기프티콘을 사용하셨나요? 완료 처리가 되지 않은 것 같아요. 확인해볼까요?',
    time: '어제',
  },
  {
    id: '4',
    type: 'SHARE',
    title: '기프티콘 나누기 알림',
    message: '나누기 성공! 아이스 카페 라떼 T가 무사히 나눔되었어요.',
    time: '2일 전',
  },
  {
    id: '5',
    type: 'SHAREBOX',
    title: '쉐어박스 알림',
    message: '‘으라차차’ 쉐어박스에 류잼문 님이 참여했어요. 기프티콘을 공유해볼까요?',
    time: '3일 전',
  },
];

// 알림이 없을 때 표시할 컴포넌트
const EmptyNotifications = ({ theme }) => (
  <View style={styles.emptyContainer}>
    <Icon name="notifications-off" type="material" size={50} color={theme.colors.grey3} />
    <Text variant="body1" style={styles.emptyText} color={theme.colors.grey2}>
      새로운 알림이 없습니다
    </Text>
  </View>
);

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { hideTabBar } = useTabBar();
  const insets = useSafeAreaInsets(); // 안전 영역 정보 가져오기

  // 화면 진입 시 탭바 숨기기
  useEffect(() => {
    hideTabBar();

    // 컴포넌트 언마운트 시 필요한 정리 작업이 있다면 여기서 처리
    return () => {
      // 예: 화면에서 나갈 때 필요한 정리 작업
    };
  }, [hideTabBar]);

  // 뒤로가기 처리
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 알림 항목 선택 처리
  const handleNotificationPress = item => {
    // 여기서 알림에 따른 화면 전환 로직 구현 가능
    // 예: navigation.navigate('TargetScreen', { data: item });
  };

  // 알림 유형에 따른 아이콘 색상 가져오기
  const getIconColorByType = type => {
    switch (type) {
      case 'EXPIRY':
        return '#EF9696';
      case 'NEARBY':
        return '#8CDA8F';
      case 'USED':
        return '#6BB2EA';
      case 'SHARE':
        return '#D095EE';
      case 'SHAREBOX':
        return '#F1A9D5';
    }
  };

  // 알림 아이템 렌더링
  const renderItem = ({ item }) => (
    <ListItem.NotificationCard
      title={item.title}
      message={item.message}
      time={item.time}
      onPress={() => handleNotificationPress(item)}
      icon={NOTIFICATION_ICONS[item.type]}
      iconColor={getIconColorByType(item.type)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={
            <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          }
        />
        <Text variant="h3" style={styles.headerTitle}>
          알림함
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* 알림 목록 */}
      <FlatList
        data={dummyNotifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyNotifications theme={theme} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 48,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default NotificationScreen;
