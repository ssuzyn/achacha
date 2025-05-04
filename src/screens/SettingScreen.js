import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-elements';
import Slider from '../components/ui/Slider';
import { Button, Divider } from '../components/ui';
import Switch from '../components/ui/Switch';

const SettingScreen = () => {
  const { theme } = useTheme();

  // 상태 관리
  const [expiryNotification, setExpiryNotification] = useState(true);
  const [giftSharingNotification, setGiftSharingNotification] = useState(true);
  const [nearbyStoreNotification, setNearbyStoreNotification] = useState(false);
  const [expiryNotificationInterval, setExpiryNotificationInterval] = useState(1);
  const [usageCompletionNotification, setUsageCompletionNotification] = useState(true);
  const [shareboxNotification, setShareboxNotification] = useState(true);

  // 슬라이더 마커 값
  const markers = [0, 1, 2, 3, 7, 30, 60, 90];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 설정 헤더 */}
      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: theme.colors.black }]}>설정</Text>
      </View>

      {/* 회원정보 섹션 */}
      <View style={[styles.section, styles.firstSection]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>회원정보</Text>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.grey3 }]}>연결된 소셜 계정</Text>
          <Text style={[styles.infoValue, { color: theme.colors.black }]}>qwer@kakao.com</Text>
        </View>
      </View>

      {/* 회원정보와 알림 사이 구분선 */}
      <Divider style={styles.sectionDivider} />

      {/* 알림 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>알림</Text>

        {/* 유효기간 만료 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              유효기간 만료 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              유효기간 임박 시 알림
            </Text>
          </View>
          <Switch value={expiryNotification} onValueChange={setExpiryNotification} />
        </View>

        {/* 유효기간 알림 주기 설정 - 만료 알림이 활성화된 경우에만 표시 */}
        {expiryNotification && (
          <View style={styles.sliderContainer}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
                유효기간 알림 주기 설정
              </Text>
              <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
                만료 알림은 오전 9시 전송, 당일/1/2/3/7/30/60/90 일 단위
              </Text>
            </View>

            <View style={styles.customSliderContainer}>
              <Slider
                value={expiryNotificationInterval}
                values={markers}
                onValueChange={value => setExpiryNotificationInterval(value)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.grey2}
                showValue={false}
                containerStyle={styles.sliderStyle}
              />
            </View>
          </View>
        )}

        {/* 주변 매장 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              주변 매장 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              각 매장 기준 150m 이내 접근 시 알림
            </Text>
          </View>
          <Switch value={nearbyStoreNotification} onValueChange={setNearbyStoreNotification} />
        </View>

        {/* 사용 완료 여부 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              사용완료 여부 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              사용완료 처리 여부 알림
            </Text>
          </View>
          <Switch
            value={usageCompletionNotification}
            onValueChange={setUsageCompletionNotification}
          />
        </View>

        {/* 기프티콘 나누기 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              기프티콘 나누기 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              기프티콘 나누기 수신 알림
            </Text>
          </View>
          <Switch value={giftSharingNotification} onValueChange={setGiftSharingNotification} />
        </View>

        {/* 쉐어박스 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              쉐어박스 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              쉐어박스 등록, 사용완료, 새 멤버 참여 알림
            </Text>
          </View>
          <Switch value={shareboxNotification} onValueChange={setShareboxNotification} />
        </View>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <Button
          title="회원탈퇴"
          type="outline"
          buttonStyle={[styles.withdrawButton, { borderColor: theme.colors.grey4 }]}
          titleStyle={{ color: theme.colors.grey3 }}
          containerStyle={styles.buttonStyle}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="로그아웃"
          buttonStyle={[styles.logoutButton, { backgroundColor: theme.colors.primary }]}
          containerStyle={styles.buttonStyle}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
  },
  contentContainer: {
    paddingTop: 0,
  },
  headerSection: {
    paddingTop: 0,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 2,
  },
  firstSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 12,
  },
  sliderContainer: {
    paddingVertical: 5,
    marginBottom: 5,
  },
  customSliderContainer: {
    marginTop: 20,
    marginBottom: 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginVertical: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonStyle: {
    flex: 1,
    maxWidth: '45%',
  },
  buttonSpacer: {
    width: 12,
  },
  withdrawButton: {
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  logoutButton: {
    paddingHorizontal: 20,
  },
  sectionDivider: {
    marginBottom: 20,
  },
});

export default SettingScreen;
