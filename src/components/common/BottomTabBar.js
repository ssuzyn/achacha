import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { useTabBar } from '../../context/TabBarContext';

// 임포트할 스크린들
import HomeScreen from '../../screens/HomeScreen';

// 임시 스크린
const GifticonManageScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>기프티콘 관리 화면</Text>
  </View>
);

const MapScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>기프티콘 MAP 화면</Text>
  </View>
);

const ShareboxScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>쉐어박스 화면</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
  'Notification',
  // 추가할 화면들...
];

// 탭 스크린 래퍼 컴포넌트 - 탭바 표시 여부를 조절하는 로직 포함
const TabScreenWrapper = ({ component: Component, name }) => {
  const { hideTabBar, showTabBar } = useTabBar();
  const navigation = useNavigation();

  // 현재 화면의 포커스 상태 변경 감지하여 탭바 표시 여부 설정
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      // 특정 화면에서 탭바 숨기기
      if (HIDDEN_TAB_BAR_SCREENS.includes(name)) {
        hideTabBar();
      } else {
        showTabBar();
      }
    });

    // 화면에서 나갈 때 리스너 해제
    return unsubscribeFocus;
  }, [navigation, hideTabBar, showTabBar, name]);

  return <Component />;
};

const BottomTabBar = () => {
  const { isTabBarVisible } = useTabBar();

  const renderTabBarIcon = (route, focused, color) => {
    let iconName;

    switch (route.name) {
      case 'Home':
        iconName = TAB_ICONS.home;
        break;
      case 'GifticonManage':
        iconName = TAB_ICONS.gifticonManage;
        break;
      case 'Map':
        iconName = TAB_ICONS.map;
        break;
      case 'Sharebox':
        iconName = TAB_ICONS.sharebox;
        break;
      case 'Settings':
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
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.border,
        tabBarLabelStyle: {
          ...styles.tabBarLabel,
          fontSize: LABEL_FONTSIZE,
        },
        tabBarStyle: {
          ...styles.tabBar,
          // 상단에 연한 Primary 색상 선 추가
          borderTopWidth: 1,
          borderTopColor: `${theme.colors.primary}20`,
          // 탭바 표시 여부에 따라 동적으로 스타일 변경
          display: isTabBarVisible ? 'flex' : 'none',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabBarItem,
        // 선택 효과 추가
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
      })}
    >
      <Tab.Screen
        name="Home"
        component={props => <TabScreenWrapper component={HomeScreen} name="Home" {...props} />}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="GifticonManage"
        component={props => (
          <TabScreenWrapper component={GifticonManageScreen} name="GifticonManage" {...props} />
        )}
        options={{
          tabBarLabel: '기프티콘 관리',
        }}
      />
      <Tab.Screen
        name="Map"
        component={props => <TabScreenWrapper component={MapScreen} name="Map" {...props} />}
        options={{
          tabBarLabel: 'MAP',
        }}
      />
      <Tab.Screen
        name="Sharebox"
        component={props => (
          <TabScreenWrapper component={ShareboxScreen} name="Sharebox" {...props} />
        )}
        options={{
          tabBarLabel: '쉐어박스',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={props => (
          <TabScreenWrapper component={SettingsScreen} name="Settings" {...props} />
        )}
        options={{
          tabBarLabel: '설정',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 82 : 62, // iOS에서 더 큰 높이 적용 (노치 고려)
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 25 : 7, // iOS에서 하단 영역 고려
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabel: {
    fontWeight: '500',
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
    marginTop: Platform.OS === 'ios' ? -3 : 0,
  },
  tabBarItem: {
    paddingVertical: 6,
  },
  iconContainer: {
    width: ICON_SIZE + 8,
    height: ICON_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTabBar;
