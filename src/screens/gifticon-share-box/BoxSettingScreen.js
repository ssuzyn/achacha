// 쉐어박스 설정 스크린

import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import NavigationService from '../../navigation/NavigationService';

const BoxSettingScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  // 쉐어박스 ID와 이름 가져오기
  const shareBoxId = route.params?.shareBoxId || 0;
  const shareBoxName = route.params?.shareBoxName || '쉐어박스';

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          쉐어박스 설정
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <View style={styles.contentContainer}>
          <Text variant="h3" weight="bold" style={styles.boxNameText}>
            {shareBoxName}
          </Text>

          {/* 여기에 설정 관련 UI 요소 추가 */}
          <Text style={styles.descriptionText}>쉐어박스 ID: {shareBoxId}</Text>

          {/* 설정 옵션 리스트 */}
          <View style={styles.settingsList}>{/* 추후 구현 예정 */}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 20,
  },
  boxNameText: {
    fontSize: 24,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  settingsList: {
    marginTop: 20,
  },
});

export default BoxSettingScreen;
