import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from 'react-native-elements';
import Slider from '../components/ui/Slider';
import { Button, Divider, Text } from '../components/ui';
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
  const [watchModalVisible, setWatchModalVisible] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0); // 0: 초기, 1: 연결 중, 2: 연결 완료

  // 슬라이더 마커 값
  const markers = [0, 1, 2, 3, 7, 30, 60, 90];

  // 워치 연결 모달 열기
  const openWatchModal = () => {
    setWatchModalVisible(true);
    setConnectionStep(0);
  };

  // 워치 연결 모달 닫기
  const closeWatchModal = () => {
    setWatchModalVisible(false);
    setConnectionStep(0);
  };

  // 워치 연결 시작
  const startConnection = () => {
    setConnectionStep(1);

    // 워치 연결 시뮬레이션 (3초 후 연결 완료)
    setTimeout(() => {
      setConnectionStep(2);
    }, 3000);
  };

  // 모달 내용 렌더링
  const renderModalContent = () => {
    // 초기 연결 화면
    if (connectionStep === 0) {
      return (
        <>
          <View style={styles.modalContent}>
            <View style={styles.watchImageContainer}>
              <Image
                source={require('../assets/images/watch.png')}
                style={styles.watchImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.modalText}>스마트 워치에서 연결하기 버튼을 눌러주세요.</Text>
          </View>
          <View style={styles.modalFooter}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.buttonContainer, styles.cancelButton]}
                onPress={closeWatchModal}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <View style={styles.buttonSpacer} />
              <TouchableOpacity
                style={[styles.buttonContainer, styles.connectButton]}
                onPress={startConnection}
              >
                <Text style={styles.buttonText}>연결</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    }

    // 연결 중 화면
    else if (connectionStep === 1) {
      return (
        <>
          <View style={styles.modalContent}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>연결 중입니다...</Text>
            </View>
          </View>
        </>
      );
    }

    // 연결 완료 화면
    else if (connectionStep === 2) {
      return (
        <>
          <View style={styles.modalContent}>
            <View style={styles.successContainer}>
              <View style={styles.watchImageContainer}>
                <Image
                  source={require('../assets/images/watch.png')}
                  style={styles.watchImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.successText}>성공적으로 연결이 완료되었습니다.</Text>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.confirmButton} onPress={closeWatchModal}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 설정 헤더 */}
      <View style={styles.headerSection}>
        <Text variant="h2" style={styles.headerTitle}>
          설정
        </Text>
      </View>

      {/* 회원정보 섹션 */}
      <View style={[styles.section, styles.firstSection]}>
        <Text variant="h3" style={styles.sectionTitle}>
          회원정보
        </Text>
        <View style={styles.infoItem}>
          <Text variant="body1" color="grey3" style={styles.infoLabel}>
            연결된 소셜 계정
          </Text>
          <Text variant="body1" style={styles.infoValue}>
            qwer@kakao.com
          </Text>
        </View>
      </View>

      {/* 회원정보와 알림 사이 구분선 */}
      <Divider style={styles.sectionDivider} />

      {/* 알림 섹션 */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          알림
        </Text>

        {/* 유효기간 만료 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text variant="body1" style={styles.notificationLabel}>
              유효기간 만료 알림
            </Text>
            <Text variant="caption" color="grey3" style={styles.notificationDescription}>
              유효기간 임박 시 알림
            </Text>
          </View>
          <Switch value={expiryNotification} onValueChange={setExpiryNotification} />
        </View>

        {/* 유효기간 알림 주기 설정 - 만료 알림이 활성화된 경우에만 표시 */}
        {expiryNotification && (
          <View style={styles.sliderContainer}>
            <View style={styles.notificationInfo}>
              <Text variant="body1" style={styles.notificationLabel}>
                유효기간 알림 주기 설정
              </Text>
              <Text variant="caption" color="grey3" style={styles.notificationDescription}>
                만료 알림은 오전 9시 전송, 당일/1/2/3/7/30/60/90일 단위
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
            <Text variant="body1" style={styles.notificationLabel}>
              주변 매장 알림
            </Text>
            <Text variant="caption" color="grey3" style={styles.notificationDescription}>
              각 매장 기준 150m 이내 접근 시 알림
            </Text>
          </View>
          <Switch value={nearbyStoreNotification} onValueChange={setNearbyStoreNotification} />
        </View>

        {/* 사용 완료 여부 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text variant="body1" style={styles.notificationLabel}>
              사용완료 여부 알림
            </Text>
            <Text variant="caption" color="grey3" style={styles.notificationDescription}>
              사용완료 처리 여부 알림
            </Text>
          </View>
          <Switch
            value={usageCompletionNotification}
            onValueChange={setUsageCompletionNotification}
          />
        </View>

        {/* 기프티콘 뿌리기 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text variant="body1" style={styles.notificationLabel}>
              기프티콘 뿌리기 알림
            </Text>
            <Text variant="caption" color="grey3" style={styles.notificationDescription}>
              기프티콘 뿌리기 수신 알림
            </Text>
          </View>
          <Switch value={giftSharingNotification} onValueChange={setGiftSharingNotification} />
        </View>

        {/* 쉐어박스 알림 */}
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text variant="body1" style={styles.notificationLabel}>
              쉐어박스 알림
            </Text>
            <Text variant="caption" color="grey3" style={styles.notificationDescription}>
              쉐어박스 등록, 사용완료, 새 멤버 참여 알림
            </Text>
          </View>
          <Switch value={shareboxNotification} onValueChange={setShareboxNotification} />
        </View>
      </View>

      {/* 알림과 워치 섹션 사이 구분선 */}
      <Divider style={styles.sectionDivider} />

      {/* 워치 섹션 */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          워치 설정
        </Text>
        <TouchableOpacity style={styles.watchItem} onPress={openWatchModal}>
          <View style={styles.notificationInfo}>
            <Text variant="body1" style={styles.notificationLabel}>
              워치 연결하기
            </Text>
            <Text variant="caption" color="grey3" style={styles.notificationDescription}>
              워치와의 연동을 진행합니다.
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>{'>'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.footerButtonContainer}>
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

      {/* 워치 연결 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={watchModalVisible}
        onRequestClose={closeWatchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: 'white' }]}>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
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
  footerButtonContainer: {
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
  watchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#aaa',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  modalFooter: {
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#A7DAF9',
  },
  connectButton: {
    backgroundColor: '#56AEE9',
  },
  confirmButton: {
    backgroundColor: '#56AEE9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
  },
  watchImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  watchImage: {
    width: 150,
    height: 150,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
});

export default SettingScreen;
