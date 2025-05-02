import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Text,
} from 'react-native';
import { useTabBar } from '../../context/TabBarContext';
import { Icon, useTheme } from 'react-native-elements';

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 26 : 24;

// 헤더 컴포넌트
const HeaderBar = ({ notificationCount = 3 }) => {
  const { isTabBarVisible } = useTabBar();
  const { theme } = useTheme();

  // 추가 버튼 클릭 핸들러
  const handleAddPress = () => {
    // 예: navigation.navigate('AddNew');
    Alert.alert('안내', '추가 기능은 준비 중입니다.');
  };

  // 알림 버튼 클릭 핸들러
  const handleNotificationPress = () => {
    // 아직 구현되지 않은 화면이므로 임시 알림 표시
    Alert.alert('안내', '알림 기능은 준비 중입니다.');
    // 아래 코드는 Notification 화면이 구현되면 주석 해제
    // navigation.navigate('Notification');
  };

  // 탭바가 숨겨져 있을 때는 헤더도 숨김
  if (!isTabBarVisible) {
    return null;
  }

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.white }]}>
      {/* 로고 영역 */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* 우측 아이콘 버튼 영역 */}
      <View style={styles.iconContainer}>
        {/* 추가 버튼 */}
        <TouchableOpacity style={styles.iconButton} onPress={handleAddPress} activeOpacity={0.7}>
          <Icon
            name="add-circle-outline"
            size={ICON_SIZE}
            color={theme.colors.primary}
            type="material"
          />
        </TouchableOpacity>

        {/* 알림 버튼 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Icon
            name="notifications-none"
            size={ICON_SIZE}
            color={theme.colors.primary}
            type="material"
          />
          {/* 알림 뱃지 */}
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <View style={styles.badgeInner}>
                <Icon
                  name="circle"
                  size={18}
                  color="#EF4040"
                  style={styles.badgeBackground}
                  type="material"
                />
                <View style={styles.badgeTextContainer}>
                  {notificationCount > 9 ? (
                    <Icon
                      name="add"
                      size={12}
                      color="#FFFFFF"
                      style={styles.badgeText}
                      type="material"
                    />
                  ) : (
                    <Text style={styles.badgeNumber}>{notificationCount}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    borderBottomWidth: 0,
    marginTop: 30,
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
    height: 40,
    justifyContent: 'center',
  },
  logo: {
    width: 110,
    height: 36,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInner: {
    position: 'relative',
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeBackground: {
    position: 'absolute',
  },
  badgeTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  badgeNumber: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HeaderBar;
