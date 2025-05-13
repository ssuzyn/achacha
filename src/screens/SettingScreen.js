import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import { useTheme } from 'react-native-elements';
import Slider from '../components/ui/Slider';
import { Divider, Text } from '../components/ui';
import Switch from '../components/ui/Switch';
import { Svg, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../api/userInfo';

const SettingScreen = () => {
  const { theme } = useTheme();
  const { WearSyncModule } = NativeModules;

  // 상태 관리
  const [expiryNotification, setExpiryNotification] = useState(true);
  const [giftSharingNotification, setGiftSharingNotification] = useState(true);
  const [nearbyStoreNotification, setNearbyStoreNotification] = useState(false);
  const [expiryNotificationInterval, setExpiryNotificationInterval] = useState(1);
  const [usageCompletionNotification, setUsageCompletionNotification] = useState(true);
  const [shareboxNotification, setShareboxNotification] = useState(true);
  const [watchModalVisible, setWatchModalVisible] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0); // 0: 초기, 1: 연결 중, 2: 연결 완료
  // 로그인 타입 (추후 API 연동 시 실제 데이터로 대체)
  // eslint-disable-next-line no-unused-vars
  const [loginType, setLoginType] = useState('kakao'); // 'kakao' 또는 'google'
  const [nickname, setNickname] = useState('');

  // 슬라이더 마커 값
  const markers = [0, 1, 2, 3, 7, 30, 60, 90];

  // Google 로고 SVG 컴포넌트
  // eslint-disable-next-line react/no-unstable-nested-components
  const GoogleLogo = () => (
    <Svg width="20" height="20" viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );

  // 워치 연결 모달 열기
  const openWatchModal = () => {
    setWatchModalVisible(true);
    setConnectionStep(0);
  };

  // 워치 연결 시작
  const startConnection = async () => {
    setConnectionStep(1);

    if (Platform.OS !== 'android') {
      Alert.alert('미지원', 'Nearby Advertising은 안드로이드에서만 사용 가능합니다.');
      setConnectionStep(0);
      return;
    }

    try {
      // 필요한 권한 목록 정의
      const permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      // 모든 필수 권한이 승인되었는지 확인
      const allPermissionsGranted = 
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

      if (allPermissionsGranted) {
        const result = await WearSyncModule.startNearbyAdvertising();
        console.log('[Nearby] Advertising started:', result);
      } else {
        Alert.alert('권한 거부됨', '워치 연결을 시작하려면 필요한 모든 권한이 필요합니다.');
        setConnectionStep(0);
      }
    } catch (error) {
      console.error('[Nearby] Failed to start advertising:', error);
      Alert.alert('오류', '워치 연결 중 오류가 발생했습니다: ' + error.message);
      setConnectionStep(0);
    }
  };

  // 워치 연결 모달 닫기
  const closeWatchModal = async () => {
    if (connectionStep === 2) {
      try {
        await WearSyncModule.stopNearbyAdvertising();
        console.log('[Nearby] Advertising stopped');
      } catch (error) {
        console.error('[Nearby] Failed to stop advertising:', error);
      }
    } else if (connectionStep === 1) {
      // 연결 중 상태에서 취소 시에도 광고 중지
      try {
        await WearSyncModule.stopNearbyAdvertising();
        console.log('[Nearby] Advertising stopped');
      } catch (error) {
        console.error('[Nearby] Failed to stop advertising:', error);
      }
    }
    setWatchModalVisible(false);
    setConnectionStep(0);
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
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.confirmButton, { marginTop: 10 }]}
              onPress={closeWatchModal}
            >
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
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

  useEffect(() => {
    if (Platform.OS === 'android' && WearSyncModule) {
      const eventEmitter = new NativeEventEmitter(WearSyncModule);
      const subscription = eventEmitter.addListener('NearbyConnected', (event) => {
        // event.endpointId가 특정 값이어야만 성공 처리 등 추가 검증 가능
        if (event && event.endpointId) {
          setConnectionStep(2);
        } else {
          // 연결 실패 처리
          Alert.alert('연결 실패', '실제 연결이 성립되지 않았습니다.');
        }
      });
      return () => subscription.remove();
    }
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const user = await fetchUserById(userId);
        setNickname(user.userName);
      } catch (e) {
        console.error('유저 정보 조회 실패:', e);
      }
    };
    fetchUserName();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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
            연결된 소셜 서비스
          </Text>
          <View style={styles.socialServiceContainer}>
            {loginType === 'kakao' ? (
              <>
                <Image
                  source={require('../assets/images/login_kakaotalk.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text variant="body1" style={styles.infoValue}>
                  카카오톡
                </Text>
              </>
            ) : (
              <>
                <GoogleLogo />
                <Text variant="body1" style={styles.infoValue2}>
                  Google
                </Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.infoItem}>
          <Text variant="body1" color="grey3" style={styles.infoLabel}>
            닉네임
          </Text>
          <Text variant="body1" style={styles.infoValue}>
            {nickname || '으라차차'}
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
              각 매장 기준 50m 이내 접근 시 알림
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
              스마트폰과 워치 연동 설정
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>{'>'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.footerButtonsWrapper}>
        <TouchableOpacity style={styles.withdrawTouchable}>
          <Text style={styles.withdrawText}>회원탈퇴</Text>
        </TouchableOpacity>
        <View style={styles.buttonSpacer} />
        <TouchableOpacity style={styles.logoutTouchable}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    marginBottom: 10,
  },
  firstSection: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'semiBold',
  },
  infoValue: {
    fontSize: 16,
  },
  infoValue2: {
    fontsize: 16,
    marginLeft: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 10,
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
  footerButtonsWrapper: {
    marginVertical: 25,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonSpacer: {
    width: 10,
  },
  withdrawTouchable: {
    borderColor: '#718096',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  logoutTouchable: {
    borderColor: '#A7DAF9',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  withdrawText: {
    color: '#718096',
    fontSize: 16,
  },
  logoutText: {
    color: '#A7DAF9',
    fontSize: 16,
  },
  sectionDivider: {
    marginBottom: 20,
    marginTop: 10,
  },
  watchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 4,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    marginLeft: -30,
    fontSize: 20,
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
    paddingVertical: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    marginBottom: 10,
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
  socialServiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
});

export default SettingScreen;
