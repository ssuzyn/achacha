import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../theme';

// 임포트할 스크린들
import HomeScreen from '../../screens/HomeScreen';

// 임시 스크린
const GifticonManageScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>기프티콘 관리 화면</Text>
  </View>
);

const GifticonMapScreen = () => (
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

const BottomTabBar = () => {
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
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="GifticonManage"
        component={GifticonManageScreen}
        options={{
          tabBarLabel: '기프티콘 관리',
        }}
      />
      <Tab.Screen
        name="Map"
        component={GifticonMapScreen}
        options={{
          tabBarLabel: 'MAP',
        }}
      />
      <Tab.Screen
        name="Sharebox"
        component={ShareboxScreen}
        options={{
          tabBarLabel: '쉐어박스',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
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
