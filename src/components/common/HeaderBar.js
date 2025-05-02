import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { useTabBar } from '../../context/TabBarContext';
import { Icon, useTheme } from 'react-native-elements';
import Badge from '../ui/Badge';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 26 : 24;

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
      <View style={{ height: insets.top, backgroundColor: theme.colors.white }} />

      <View style={[styles.header, { backgroundColor: theme.colors.white }]}>
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
            {/* 알림 뱃지 - Badge 컴포넌트 사용 */}
            {notificationCount > 0 && (
              <View style={styles.badgeContainer}>
                <Badge
                  value={notificationCount > 9 ? '+' : notificationCount.toString()}
                  status="error"
                  size="sm"
                  containerStyle={styles.badgeStyle}
                />
              </View>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 32,
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
  },
  logo: {
    width: 90,
    height: 30,
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
  badgeContainer: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
  badgeStyle: {
    borderRadius: 10,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 2,
  },
});

export default HeaderBar;
