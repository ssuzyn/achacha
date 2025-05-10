import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Image, Platform, Dimensions, View } from 'react-native';
import { useTabBar } from '../../context/TabBarContext';
import { Icon, useTheme } from 'react-native-elements';
import { Badge } from '../ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationService from '../../navigation/NavigationService';

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 28 : 26;

// 헤더 컴포넌트
const HeaderBar = ({ notificationCount = 3 }) => {
  const { isTabBarVisible } = useTabBar();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // 안전 영역 정보 가져오기

  // 추가 버튼 클릭 핸들러
  const handleAddPress = useCallback(() => {
    // RegisterScreen 화면으로 이동
    NavigationService.navigate('Register', {}, true);
  }, []);

  // 알림 버튼 클릭 핸들러 - 성능 최적화
  const handleNotificationPress = useCallback(() => {
    // NavigationService를 사용하여 성능 최적화
    NavigationService.navigate('Notification', {}, true);
  }, []);

  // 메모이제이션된 뱃지 카운트 컴포넌트
  const BadgeComponent = useMemo(() => {
    if (notificationCount <= 0) return null;

    return (
      <View style={styles.badgeContainer}>
        <Badge value={notificationCount.toString()} status="error" size="sm" />
      </View>
    );
  }, [notificationCount]);

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
            {BadgeComponent}
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
    paddingHorizontal: 18,
    paddingTop: 10,
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
