import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-elements';
import Slider from '../components/ui/Slider';
import { Button } from '../components/ui';
import Switch from '../components/ui/Switch';

const SettingScreen = () => {
  const { theme } = useTheme();

  // 상태 관리
  const [expiryNotification, setExpiryNotification] = useState(true);
  const [giftSharingNotification, setGiftSharingNotification] = useState(true);
  const [nearbyStoreNotification, setNearbyStoreNotification] = useState(false);
  const [expiryNotificationInterval, setExpiryNotificationInterval] = useState(7);

  // 슬라이더 마커 값
  const markers = [0, 1, 2, 3, 7, 30, 60, 90];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.white }]}
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
        <View style={[styles.infoItem, { borderBottomColor: theme.colors.grey5 }]}>
          <Text style={[styles.infoLabel, { color: theme.colors.grey1 }]}>연결된 소셜 계정</Text>
          <Text style={[styles.infoValue, { color: theme.colors.black }]}>qwer@kakao.com</Text>
        </View>
      </View>

      {/* 알림 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>알림</Text>

        {/* 유효기간 만료 알림 */}
        <View style={[styles.notificationItem, { borderBottomColor: theme.colors.grey5 }]}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              유효기간 만료 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              해제 시 유효기간 만료 알림이 중단됩니다.
            </Text>
          </View>
          <Switch value={expiryNotification} onValueChange={setExpiryNotification} />
        </View>

        {/* 유효기간 알림 주기 설정 */}
        <View style={[styles.sliderContainer, { borderBottomColor: theme.colors.grey5 }]}>
          <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
            유효기간 알림 주기 설정
          </Text>
          <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
            만료 알림은 오전 9시에 전송됩니다.
          </Text>
          <View style={styles.customSliderContainer}>
            <Slider
              value={expiryNotificationInterval}
              minimumValue={0}
              maximumValue={7}
              step={1}
              onValueChange={value => setExpiryNotificationInterval(markers[Math.round(value)])}
              showValue={false}
              showMinMax={false}
              renderCustomMarkers={() => (
                <View style={styles.markersContainer}>
                  {markers.map((marker, index) => (
                    <View key={index} style={styles.markerItem}>
                      <View
                        style={[
                          styles.marker,
                          {
                            backgroundColor: index === 4 ? theme.colors.error : theme.colors.grey4,
                          },
                          index === 4 ? { height: 12 } : { height: 8 },
                        ]}
                      />
                      <Text
                        style={[
                          styles.markerLabel,
                          {
                            color:
                              expiryNotificationInterval === marker
                                ? theme.colors.primary
                                : theme.colors.grey3,
                          },
                        ]}
                      >
                        {marker}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            />
          </View>
        </View>

        {/* 선물 나누기 알림 */}
        <View style={[styles.notificationItem, { borderBottomColor: theme.colors.grey5 }]}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              선물 나누기 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              해제 시 기프티콘 나누기 알림이 중단됩니다.
            </Text>
          </View>
          <Switch value={giftSharingNotification} onValueChange={setGiftSharingNotification} />
        </View>

        {/* 근접 매장 알림 */}
        <View style={[styles.notificationItem, { borderBottomColor: theme.colors.grey5 }]}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationLabel, { color: theme.colors.black }]}>
              근접 매장 알림
            </Text>
            <Text style={[styles.notificationDescription, { color: theme.colors.grey3 }]}>
              해제 시 근접 매장 알림이 중단됩니다.
            </Text>
          </View>
          <Switch value={nearbyStoreNotification} onValueChange={setNearbyStoreNotification} />
        </View>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <Button
          title="회원탈퇴"
          type="outline"
          buttonStyle={[styles.withdrawButton, { borderColor: theme.colors.grey4 }]}
          titleStyle={{ color: theme.colors.grey3 }}
        />
        <Button
          title="로그아웃"
          buttonStyle={[styles.logoutButton, { backgroundColor: theme.colors.primary }]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  contentContainer: {
    paddingTop: 0,
  },
  headerSection: {
    paddingTop: 0,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
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
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  customSliderContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -8,
  },
  markerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 2,
    borderRadius: 1,
  },
  markerLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  buttonContainer: {
    marginVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withdrawButton: {
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  logoutButton: {
    paddingHorizontal: 20,
  },
});

export default SettingScreen;
