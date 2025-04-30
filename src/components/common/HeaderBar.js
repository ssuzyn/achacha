import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTabBar } from '../../context/TabBarContext';
import theme from '../../theme';

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 26 : 24;

// 헤더 컴포넌트
const HeaderBar = ({ notificationCount = 3 }) => {
  const navigation = useNavigation();
  const { isTabBarVisible } = useTabBar();

  // 추가 버튼 클릭 핸들러
  const handleAddPress = () => {
    // 추가 메뉴 또는 추가 화면으로 이동
    console.log('추가 버튼 클릭');
    // 예: navigation.navigate('AddNew');
  };

  // 알림 버튼 클릭 핸들러
  const handleNotificationPress = () => {
    // 알림 화면으로 이동
    console.log('알림 버튼 클릭');
    navigation.navigate('Notification');
  };

  // 탭바가 숨겨져 있을 때는 헤더도 숨김
  if (!isTabBarVisible) {
    return null;
  }

  return (
    <View style={styles.header}>
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
          <Icon name="add-circle-outline" size={ICON_SIZE} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* 알림 버튼 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Icon name="notifications-none" size={ICON_SIZE} color={theme.colors.primary} />
          {/* 알림 뱃지 */}
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <View style={styles.badgeInner}>
                <Icon name="circle" size={18} color="red" style={styles.badgeBackground} />
                <View style={styles.badgeTextContainer}>
                  <Icon
                    name={notificationCount > 9 ? 'add' : `${notificationCount}`}
                    size={12}
                    color="white"
                    style={styles.badgeText}
                  />
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
    backgroundColor: theme.colors.background,
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
});

export default HeaderBar;
