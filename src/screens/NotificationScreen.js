import React, { useEffect, useCallback, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  StatusBar,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  InteractionManager,
} from 'react-native';
import { Icon, useTheme } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTabBar } from '../context/TabBarContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ListItem, Text } from '../components/ui';

// 알림 타입에 따른 아이콘 정의
const NOTIFICATION_ICONS = {
  EXPIRY: 'calendar-month', // 유효기간 만료 알림
  NEARBY: 'share-location', // 주변 매장 알림
  USED: 'schedule', // 사용완료 여부 알림
  SHARE: 'tap-and-play', // 기프티콘 뿌리기 알림
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
    title: '기프티콘 뿌리기 알림',
    message: '뿌리기 성공! 아이스 카페 라떼 T가 무사히 나눔되었어요.',
    time: '2일 전',
  },
  {
    id: '5',
    type: 'SHAREBOX',
    title: '쉐어박스 알림',
    message: '으라차차 쉐어박스에 류잼문 님이 참여했어요. 기프티콘을 공유해볼까요?',
    time: '3일 전',
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { hideTabBar, showTabBar } = useTabBar();
  const insets = useSafeAreaInsets(); // 안전 영역 정보 가져오기
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // 라우트 파라미터에서 keepTabBarVisible 옵션 확인
  const keepTabBarVisible = route.params?.keepTabBarVisible || false;

  // 화면 진입 시 데이터 로딩 및 탭바 처리
  useEffect(() => {
    // 데이터 로딩 시뮬레이션 - 지연 없이 바로 데이터 설정
    setNotifications(dummyNotifications);
    setIsLoading(false);

    // 애니메이션이 완료된 후에 탭바 숨기기
    const interactionComplete = InteractionManager.runAfterInteractions(() => {
      if (!keepTabBarVisible) {
        hideTabBar();
      }
    });

    // 화면 이탈 시 탭바 복원 및 리소스 정리
    return () => {
      interactionComplete.cancel();
      showTabBar();
    };
  }, [hideTabBar, showTabBar, keepTabBarVisible]);

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 알림 항목 선택 처리
  const handleNotificationPress = useCallback(item => {
    // 여기서 알림에 따른 화면 전환 로직 구현 가능
    // 예: navigation.navigate('TargetScreen', { data: item });
  }, []);

  // 알림 유형에 따른 아이콘 색상 가져오기
  const getIconColorByType = useCallback(type => {
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
      default:
        return '#4B9CFF';
    }
  }, []);

  // 알림 아이템 렌더링 - 직접 ListItem.NotificationCard 사용
  const renderItem = useCallback(
    ({ item }) => (
      <ListItem.NotificationCard
        title={item.title}
        message={item.message}
        time={item.time}
        onPress={() => handleNotificationPress(item)}
        icon={NOTIFICATION_ICONS[item.type]}
        iconColor={getIconColorByType(item.type)}
      />
    ),
    [handleNotificationPress, getIconColorByType]
  );

  const keyExtractor = useCallback(item => item.id, []);

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
        <View style={styles.emptyRightSpace} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
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
  emptyRightSpace: {
    width: 48,
    height: 48,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;
