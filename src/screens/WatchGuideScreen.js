import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Icon, useTheme } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '../components/ui';
import { Shadow } from 'react-native-shadow-2';

const { width } = Dimensions.get('window');

const WatchGuideScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(false); // 워치 연결 상태

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 워치 연동 시작하기 버튼 처리
  const handleStartWatchConnection = useCallback(() => {
    // 여기서 워치 연동 로직 구현 가능
    setIsConnected(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={
            <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          }
        />
        <Text variant="h3" style={styles.headerTitle}>
          워치 활용 가이드
        </Text>
        <View style={styles.emptyRightSpace} />
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 타이틀 및 소개 */}
        <View style={styles.introSection}>
          <Text variant="h2" weight="bold" style={styles.mainTitle}>
            스마트워치에서도,{'\n'}기프티콘은 자유롭게
          </Text>
          <Text variant="body1" style={styles.subText}>
            폰 없이도 확인하고, 선물하고, 관리하세요.{'\n'}당신의 손목에서 기프티콘이 살아납니다.
          </Text>
          <Image
            source={require('../assets/images/watch.png')}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        {/* 1. 스마트 연동 시작하기 */}
        <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.03)'} style={styles.cardShadow}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon
                name="watch"
                type="material"
                size={24}
                color={theme.colors.white}
                containerStyle={[styles.iconBackground, { backgroundColor: theme.colors.primary }]}
              />
            </View>
            <Text variant="h4" weight="semiBold" style={styles.featureTitle}>
              스마트 연동 시작하기
            </Text>
            <Text variant="body2" style={styles.featureDescription}>
              스마트폰과 워치를 자동으로 연동해요. Nearby API로 가까이 있을 때 자동 연결됩니다.
            </Text>

            {/* 연결 상태 표시 */}
            <View style={styles.connectionStatusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isConnected ? '#4CAF50' : '#FFA000' },
                ]}
              />
              <Text variant="body2" weight="semiBold" style={styles.statusText}>
                {isConnected ? '연결됨' : '연결 필요'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.guideButton}
              onPress={() => {
                /* 연결 가이드 보기 */
              }}
            >
              <Text variant="body2" weight="medium" color="primary">
                연결 방법 보기
              </Text>
              <Icon
                name="arrow-forward-ios"
                type="material"
                size={14}
                color={theme.colors.primary}
                containerStyle={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </Shadow>

        {/* 2. 기프티콘 관리 기능 */}
        <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.03)'} style={styles.cardShadow}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon
                name="card-giftcard"
                type="material"
                size={24}
                color={theme.colors.white}
                containerStyle={[styles.iconBackground, { backgroundColor: '#F1A9D5' }]}
              />
            </View>
            <Text variant="h4" weight="semiBold" style={styles.featureTitle}>
              기프티콘 관리 기능
            </Text>

            {/* 사용 가능한 목록 */}
            <View style={styles.subFeatureContainer}>
              <View style={styles.subFeatureHeader}>
                <Icon
                  name="check-circle"
                  type="material"
                  size={18}
                  color={'#4CAF50'}
                  containerStyle={{ marginRight: 8 }}
                />
                <Text variant="subtitle1" weight="semiBold">
                  사용 가능한 목록
                </Text>
              </View>
              <Text variant="body2" style={styles.subFeatureDescription}>
                워치에서 바로 사용 가능한 기프티콘을 확인할 수 있어요.
              </Text>
            </View>

            {/* 기프티콘 상세 */}
            <View style={styles.subFeatureContainer}>
              <View style={styles.subFeatureHeader}>
                <Icon
                  name="search"
                  type="material"
                  size={18}
                  color={'#2196F3'}
                  containerStyle={{ marginRight: 8 }}
                />
                <Text variant="subtitle1" weight="semiBold">
                  기프티콘 상세
                </Text>
              </View>
              <Text variant="body2" style={styles.subFeatureDescription}>
                기프티콘 정보를 상세히 확인하고, 바코드를 볼 수 있어요.
              </Text>
            </View>

            {/* 상품형 기프티콘 */}
            <View style={styles.giftTypeContainer}>
              <Text variant="subtitle1" weight="semiBold" style={styles.giftTypeTitle}>
                📦 상품형 기프티콘
              </Text>
              <View style={styles.giftTypeFeatureList}>
                <View style={styles.giftTypeFeature}>
                  <Icon name="qr-code-scanner" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    바코드 보기: 밝기를 최대로 조정해 바코드를 또렷하게!
                  </Text>
                </View>
                <View style={styles.giftTypeFeature}>
                  <Icon name="share" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    뿌리기: 근처 사용자 탐색 후 랜덤 전송, BLE 기반
                  </Text>
                </View>
                <View style={styles.giftTypeFeature}>
                  <Icon name="check" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    사용 처리: 터치 한 번으로 사용 완료
                  </Text>
                </View>
              </View>
            </View>

            {/* 금액형 기프티콘 */}
            <View style={styles.giftTypeContainer}>
              <Text variant="subtitle1" weight="semiBold" style={styles.giftTypeTitle}>
                💰 금액형 기프티콘
              </Text>
              <View style={styles.giftTypeFeatureList}>
                <View style={styles.giftTypeFeature}>
                  <Icon name="qr-code-scanner" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    바코드 보기: 가맹점에서 빠르게 보여주세요!
                  </Text>
                </View>
                <View style={styles.giftTypeFeature}>
                  <Icon name="payments" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    사용 금액 입력: 사용 금액 입력 후 자동 계산
                  </Text>
                </View>
                <View style={styles.giftTypeFeature}>
                  <Icon name="done-all" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    잔액 0원 시 자동 완료 처리
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Shadow>

        {/* 3. 알림함 기능 */}
        <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.03)'} style={styles.cardShadow}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon
                name="notifications"
                type="material"
                size={24}
                color={theme.colors.white}
                containerStyle={[styles.iconBackground, { backgroundColor: '#D095EE' }]}
              />
            </View>
            <Text variant="h4" weight="semiBold" style={styles.featureTitle}>
              알림함 기능
            </Text>
            <Text variant="body2" style={styles.featureDescription}>
              쉐어박스 제외, 나에게 온 알림을 워치에서도 확인하세요. 중요 알림은 놓치지 않도록
              손목에서 바로!
            </Text>

            <View style={styles.imagePlaceholder}>
              <Icon name="watch" type="material" size={40} color="#ccc" />
              <Text variant="caption" style={{ textAlign: 'center', marginTop: 10, color: '#999' }}>
                알림 화면 예시
              </Text>
            </View>
          </View>
        </Shadow>

        {/* 하단 여백 */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 10 }]}>
        <Button
          title="워치 연동 시작하기"
          onPress={handleStartWatchConnection}
          containerStyle={styles.buttonContainer}
          buttonStyle={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          titleStyle={styles.buttonTitle}
        />
      </View>
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
  backButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyRightSpace: {
    width: 48,
    height: 48,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  introSection: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 26,
    lineHeight: 36,
    marginBottom: 10,
  },
  subText: {
    lineHeight: 24,
    marginBottom: 20,
    color: '#555',
  },
  mainImage: {
    width: width - 40,
    height: 180,
    alignSelf: 'center',
    marginTop: 10,
  },
  cardShadow: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  featureIconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    marginBottom: 12,
  },
  featureDescription: {
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#333',
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
  },
  subFeatureContainer: {
    marginBottom: 16,
  },
  subFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subFeatureDescription: {
    marginLeft: 26,
    color: '#555',
    lineHeight: 20,
  },
  giftTypeContainer: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    padding: 14,
    borderRadius: 12,
  },
  giftTypeTitle: {
    marginBottom: 12,
  },
  giftTypeFeatureList: {
    gap: 8,
  },
  giftTypeFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  giftTypeFeatureText: {
    flex: 1,
    color: '#555',
    lineHeight: 20,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 10,
    height: 160,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  startButton: {
    borderRadius: 12,
    paddingVertical: 15,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WatchGuideScreen;
