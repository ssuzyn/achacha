import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTabBar } from '../../context/TabBarContext';
import HeaderBar from './HeaderBar';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../../components/ui/gluestack-ui-provider';

// 임포트할 스크린들
import HomeScreen from '../../screens/HomeScreen';

// 임시 스크린
const GifticonManageScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    }}
  >
    <Text>기프티콘 관리 화면</Text>
  </View>
);

const MapScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    }}
  >
    <Text>기프티콘 MAP 화면</Text>
  </View>
);

const ShareboxScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    }}
  >
    <Text>쉐어박스 화면</Text>
  </View>
);

const SettingsScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    }}
  >
    <Text>설정 화면</Text>
  </View>
);

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
  'GifticonDetail',
  'AddGifticon',
  'EditProfile',
  // 추가할 화면들...
];

// 헤더바가 포함된 스크린 컴포넌트
const ScreenWithHeader = ({ children }) => (
  <View style={{ flex: 1, backgroundColor: 'white' }}>
    <HeaderBar notificationCount={3} />
    <View
      style={{
        flex: 1,
        paddingTop: 12,
        paddingHorizontal: 16,
        backgroundColor: 'white',
      }}
    >
      {children}
    </View>
  </View>
);

// GluestackUIProvider로 감싸는 HOC
const withGluestack = Component => {
  return props => (
    <GluestackUIProvider config={config}>
      <Component {...props} />
    </GluestackUIProvider>
  );
};

// 탭 스크린 래퍼 컴포넌트 - 탭바 표시 여부를 조절하는 로직 포함
const createWrappedComponent = (Component, screenName) => {
  // 각 화면에 대한 래퍼 컴포넌트를 미리 생성
  const WrappedScreenComponent = props => {
    const { hideTabBar, showTabBar } = useTabBar();
    const navigation = useNavigation();

    // GluestackUIProvider로 감싼 컴포넌트
    const WrappedComponent = withGluestack(Component);

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
        <WrappedComponent {...props} />
      </ScreenWithHeader>
    );
  };

  return WrappedScreenComponent;
};

// 각 화면에 대한 래퍼 컴포넌트를 미리 생성
const WrappedHomeScreen = createWrappedComponent(HomeScreen, 'Home');
const WrappedGifticonManageScreen = createWrappedComponent(GifticonManageScreen, 'GifticonManage');
const WrappedMapScreen = createWrappedComponent(MapScreen, 'Map');
const WrappedShareboxScreen = createWrappedComponent(ShareboxScreen, 'Sharebox');
const WrappedSettingsScreen = createWrappedComponent(SettingsScreen, 'Settings');

const BottomTabBar = () => {
  const { isTabBarVisible } = useTabBar();

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
        <Icon name={iconName} size={ICON_SIZE} color={color} />
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => renderTabBarIcon(route, focused, color),
        tabBarActiveTintColor: '#56AEE9',
        tabBarInactiveTintColor: '#718096',
        tabBarLabelStyle: {
          ...styles.tabBarLabel,
          fontSize: LABEL_FONTSIZE,
        },
        tabBarStyle: {
          ...styles.tabBar,
          // 테두리 제거
          borderTopWidth: 0,
          backgroundColor: 'white',
          // 탭바 표시 여부에 따라 동적으로 스타일 변경
          display: isTabBarVisible ? 'flex' : 'none',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabBarItem,
        // 호버 효과 제거
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
        }}
      />
      <Tab.Screen
        name="TabGifticonManage"
        component={WrappedGifticonManageScreen}
        options={{
          tabBarLabel: '기프티콘 관리',
        }}
      />
      <Tab.Screen
        name="TabMap"
        component={WrappedMapScreen}
        options={{
          tabBarLabel: 'MAP',
        }}
      />
      <Tab.Screen
        name="TabSharebox"
        component={WrappedShareboxScreen}
        options={{
          tabBarLabel: '쉐어박스',
        }}
      />
      <Tab.Screen
        name="TabSettings"
        component={WrappedSettingsScreen}
        options={{
          tabBarLabel: '설정',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 65, // 안드로이드/iOS 일관된 높이
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'transparent', // 그림자 제거
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0, // 그림자 제거
      },
    }),
  },
  tabBarItem: {
    paddingTop: 8,
    height: 65,
  },
  tabBarLabel: {
    marginTop: 0,
    marginBottom: 6,
    fontWeight: '500',
  },
  iconContainer: {
    marginBottom: -4,
  },
});

export default BottomTabBar;
