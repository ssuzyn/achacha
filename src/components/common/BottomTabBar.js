import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, Dimensions, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTabBar } from '../../context/TabBarContext';
import HeaderBar from './HeaderBar';
import { Icon, useTheme } from 'react-native-elements';
import { Text } from '../ui';

// 임포트할 스크린들
import HomeScreen from '../../screens/HomeScreen';
import SettingScreen from '../../screens/SettingScreen';
import ManageListScreen from '../../screens/gifticon-management/ManageListScreen';
import BoxMainScreen from '../../screens/gifticon-share-box/BoxMainScreen';

// 임시 스크린
const MapScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
      <Text variant="body1" weight="medium" style={styles.screenText}>
        기프티콘 MAP 화면
      </Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

// 각 탭의 아이콘 정의
const TAB_ICONS = {
  home: 'home',
  gifticonManage: 'qr-code',
  map: 'location-on',
  sharebox: 'inventory-2',
  settings: 'settings',
};

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 26 : 24;
const LABEL_FONTSIZE = width > 380 ? 11 : 10;

// 특정 화면에서 탭바를 숨길 화면 목록
const HIDDEN_TAB_BAR_SCREENS = [
  'AddGifticon',
  'EditProfile',
  // 추가할 화면들...
];

// 헤더바가 포함된 스크린 컴포넌트
const ScreenWithHeader = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.colors.background }]}>
      <HeaderBar notificationCount={3} />
      <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
        {children}
      </View>
    </View>
  );
};

// 탭 스크린 래퍼 컴포넌트 - 탭바 표시 여부를 조절하는 로직 포함
const createWrappedComponent = (Component, screenName) => {
  // 각 화면에 대한 래퍼 컴포넌트를 미리 생성
  const WrappedScreenComponent = props => {
    const { hideTabBar, showTabBar } = useTabBar();
    const navigation = useNavigation();

    // 현재 화면의 포커스 상태 변경 감지하여 탭바 표시 여부 설정
    useEffect(() => {
      const unsubscribeFocus = navigation.addListener('focus', () => {
        // 특정 화면에서 탭바 숨기기
        if (HIDDEN_TAB_BAR_SCREENS.includes(screenName)) {
          hideTabBar();
        } else {
          showTabBar();
        }
      });

      // 화면에서 나갈 때 리스너 해제
      return unsubscribeFocus;
    }, [navigation, hideTabBar, showTabBar]);

    return (
      <ScreenWithHeader>
        <Component {...props} />
      </ScreenWithHeader>
    );
  };

  return WrappedScreenComponent;
};

// 각 화면에 대한 래퍼 컴포넌트를 미리 생성
const WrappedHomeScreen = createWrappedComponent(HomeScreen, 'Home');
const WrappedGifticonManageScreen = createWrappedComponent(ManageListScreen, 'GifticonManage');
const WrappedMapScreen = createWrappedComponent(MapScreen, 'Map');
const WrappedShareboxScreen = createWrappedComponent(BoxMainScreen, 'Sharebox');
const WrappedSettingsScreen = createWrappedComponent(SettingScreen, 'Settings');

const BottomTabBar = () => {
  const { isTabBarVisible } = useTabBar();
  const { theme } = useTheme();

  const renderTabBarIcon = (route, focused, color) => {
    let iconName;

    switch (route.name) {
      case 'TabHome':
        iconName = TAB_ICONS.home;
        break;
      case 'TabGifticonManage':
        iconName = TAB_ICONS.gifticonManage;
        break;
      case 'TabMap':
        iconName = TAB_ICONS.map;
        break;
      case 'TabSharebox':
        iconName = TAB_ICONS.sharebox;
        break;
      case 'TabSettings':
        iconName = TAB_ICONS.settings;
        break;
      default:
        iconName = 'help-outline';
    }

    return (
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={ICON_SIZE} color={color} type="material" />
      </View>
    );
  };

  // 커스텀 탭바 버튼 렌더링 함수 - TabNavigator와의 호환성을 위해 TouchableOpacity 유지
  const renderTabBarButton = props => {
    return <TouchableOpacity {...props} activeOpacity={1} style={props.style} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => renderTabBarIcon(route, focused, color),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.grey3,
        tabBarLabelStyle: {
          ...styles.tabBarLabel,
          fontSize: LABEL_FONTSIZE,
        },
        tabBarStyle: {
          ...styles.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.colors.primary,
          backgroundColor: theme.colors.background,
          display: isTabBarVisible ? 'flex' : 'none',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          ...styles.tabBarItem,
          justifyContent: 'center',
        },
        tabBarButton: renderTabBarButton,
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 1,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
      })}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen
        name="TabHome"
        component={WrappedHomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarLabelStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: LABEL_FONTSIZE,
          },
        }}
      />
      <Tab.Screen
        name="TabGifticonManage"
        component={WrappedGifticonManageScreen}
        options={{
          tabBarLabel: '기프티콘 관리',
          tabBarLabelStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: LABEL_FONTSIZE,
          },
        }}
      />
      <Tab.Screen
        name="TabMap"
        component={WrappedMapScreen}
        options={{
          tabBarLabel: 'MAP',
          tabBarLabelStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: LABEL_FONTSIZE,
          },
        }}
      />
      <Tab.Screen
        name="TabSharebox"
        component={WrappedShareboxScreen}
        options={{
          tabBarLabel: '쉐어박스',
          tabBarLabelStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: LABEL_FONTSIZE,
          },
        }}
      />
      <Tab.Screen
        name="TabSettings"
        component={WrappedSettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarLabelStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: LABEL_FONTSIZE,
          },
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  headerContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabBar: {
    height: 65,
    backgroundColor: 'transparent',
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
  tabBarItem: {
    paddingTop: 2,
    paddingBottom: 0,
    height: 65,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    marginTop: 0,
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
  },
  iconContainer: {
    marginBottom: -2,
    padding: 0,
  },
});

export default BottomTabBar;
