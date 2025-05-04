import React from 'react';
import { StyleSheet, Image, Platform, Dimensions, Alert, View } from 'react-native';
import { useTabBar } from '../../context/TabBarContext';
import { Icon, useTheme } from 'react-native-elements';
import { Badge } from '../ui';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 28 : 26;

// 헤더 컴포넌트
const HeaderBar = ({ notificationCount = 3 }) => {
  const { isTabBarVisible } = useTabBar();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // 안전 영역 정보 가져오기

  // 추가 버튼 클릭 핸들러
  const handleAddPress = () => {
    // 예: navigation.navigate('AddNew');
    Alert.alert('안내', '추가 기능은 준비 중입니다.');
  };

  // 알림 버튼 클릭 핸들러
  const handleNotificationPress = () => {
    // 알림 화면으로 이동
    navigation.navigate('Notification');
  };

  // 탭바가 숨겨져 있을 때는 헤더도 숨김
  if (!isTabBarVisible) {
    return null;
  }

  return (
    <View>
      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* 우측 아이콘 버튼 영역 */}
        <View style={styles.iconContainer}>
          {/* 추가 버튼 */}
          <Icon
            name="add-circle-outline"
            size={ICON_SIZE}
            color={theme.colors.primary}
            type="material"
            containerStyle={styles.addIcon}
            onPress={handleAddPress}
          />

          {/* 알림 버튼 */}
          <View style={styles.notificationBadgeContainer}>
            <Icon
              name="notifications-none"
              size={ICON_SIZE}
              color={theme.colors.primary}
              type="material"
              containerStyle={styles.notificationIcon}
              onPress={handleNotificationPress}
            />
            {/* 알림 뱃지 - Badge 컴포넌트 사용 */}
            {notificationCount > 0 && (
              <View style={styles.badgeContainer}>
                <Badge value={notificationCount.toString()} status="error" size="sm" />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  logoContainer: {
    height: 35,
    justifyContent: 'center',
    marginLeft: 8,
  },
  logo: {
    width: 90,
    height: 30,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 10,
    paddingRight: 0,
  },
  addIcon: {
    marginRight: 12,
    padding: 0,
    backgroundColor: 'transparent',
  },
  notificationBadgeContainer: {
    position: 'relative',
  },
  notificationIcon: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
});

export default HeaderBar;
