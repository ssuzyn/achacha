import React, { useEffect } from 'react';
import { StyleSheet, FlatList, StatusBar } from 'react-native';
import { Icon, useTheme, View, Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useTabBar } from '../context/TabBarContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ListItem, Badge } from '../components/ui';

// 더미 알림 데이터
const dummyNotifications = [
  {
    id: '1',
    title: '새로운 매칭이 있습니다',
    message: '새로운 매칭 요청이 왔습니다. 확인해보세요!',
    time: '10분 전',
    read: false,
  },
  {
    id: '2',
    title: '커뮤니티 인기글',
    message: '회원님의 게시글이 인기글로 선정되었습니다.',
    time: '1시간 전',
    read: false,
  },
  {
    id: '3',
    title: '상대방이 매칭을 수락했습니다',
    message: '상대방이 회원님의 매칭 요청을 수락했습니다. 대화를 시작해보세요!',
    time: '3시간 전',
    read: true,
  },
  {
    id: '4',
    title: '서비스 점검 안내',
    message: '내일 오전 2시부터 4시까지 서비스 점검이 있을 예정입니다.',
    time: '어제',
    read: true,
  },
  {
    id: '5',
    title: '포인트 적립 안내',
    message: '출석체크로 100포인트가 적립되었습니다.',
    time: '2일 전',
    read: true,
  },
];

// 알림이 없을 때 표시할 컴포넌트
const EmptyNotifications = ({ theme }) => (
  <View style={styles.emptyContainer}>
    <Icon name="notifications-off" type="material" size={50} color={theme.colors.grey3} />
    <Text style={[styles.emptyText, { color: theme.colors.grey2 }]}>새로운 알림이 없습니다</Text>
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

  // 알림 아이템 렌더링
  const renderItem = ({ item }) => (
    <ListItem
      title={item.title}
      subtitle={
        <>
          <Text style={[styles.notificationMessage, { color: theme.colors.grey }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: theme.colors.grey2 }]}>{item.time}</Text>
        </>
      }
      onPress={() => handleNotificationPress(item)}
      containerStyle={[
        styles.notificationItem,
        { backgroundColor: item.read ? theme.colors.white : theme.colors.lightBlue },
      ]}
      rightElement={
        !item.read ? <Badge status="primary" size="sm" containerStyle={styles.unreadDot} /> : null
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.white }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.white }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={
            <Icon name="arrow-back-ios" type="material" size={28} color={theme.colors.black} />
          }
        />
        <Text style={[styles.headerTitle, { color: theme.colors.black }]}>알림함</Text>
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
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 48, // 뒤로가기 버튼과 동일한 너비
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
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
