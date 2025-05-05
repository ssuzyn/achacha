// 기프티콘 등록 스크린

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Text } from '../../components/ui';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RegisterScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
          기프티콘 등록
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 업로드 카드 */}
        <Card style={styles.uploadCard}>
          <View style={styles.uploadContent}>
            <View style={styles.iconCircle}>
              <Icon name="file-upload" type="material" size={30} color="white" />
            </View>
            <Text variant="subtitle1" weight="bold" style={styles.uploadTitle}>
              기프티콘 업로드
            </Text>
            <Text variant="body2" style={styles.uploadSubtitle}>
              지금 바로 갤러리에 저장된
            </Text>
            <Text variant="body2" style={styles.uploadSubtitle}>
              기프티콘을 업로드 해보세요.
            </Text>
          </View>
        </Card>

        {/* 수동 등록 버튼 */}
        <Button title="수동 등록" variant="secondary" style={styles.manualButton} />
        <Text variant="caption" style={styles.manualButtonSubtext}>
          등록에 문제가 발생하셨나요?
        </Text>

        <View style={styles.divider} />

        {/* 등록하신 기프티콘은... 섹션 */}
        <View style={styles.infoSection}>
          <Text variant="subtitle1" weight="bold" style={styles.infoTitle}>
            등록하신 기프티콘은
          </Text>
          <Text variant="subtitle1" weight="bold" style={styles.infoTitle}>
            다음과 같은 절차를 통해 관리돼요.
          </Text>
        </View>

        {/* 절차 스텝 */}
        <View style={styles.stepsContainer}>
          {/* 스텝 1 */}
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text variant="h3" weight="bold" style={styles.stepNumber}>
                1
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="semiBold" style={styles.stepTitle}>
                갤러리에 저장된 기프티콘을
              </Text>
              <Text variant="body1" weight="semiBold" style={styles.stepTitle}>
                앱에 업로드해요.
              </Text>
            </View>
          </View>

          {/* 스텝 2 */}
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text variant="h3" weight="bold" style={styles.stepNumber}>
                2
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="semiBold" style={styles.stepTitle}>
                OCR 기술을 통해
              </Text>
              <Text variant="body1" weight="semiBold" style={styles.stepTitle}>
                브랜드, 상품, 유효기간을 모두 저장해요.
              </Text>
            </View>
          </View>

          {/* 스텝 3 */}
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text variant="h3" weight="bold" style={styles.stepNumber}>
                3
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="semiBold" style={styles.stepTitle}>
                이렇게 저장된 기프티콘은
              </Text>
              <Text variant="body1" weight="semiBold" style={styles.stepTitle}>
                사용, 선물, 공유가 가능해져요.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
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
  rightPlaceholder: {
    width: 48,
  },
  uploadCard: {
    backgroundColor: '#C9E0FD',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 10,
  },
  uploadContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: '#333',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualButton: {
    backgroundColor: '#D9D9DF',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 4,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualButtonSubtext: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: '#333',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#80C2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: 'white',
    fontSize: 24,
  },
  stepContent: {
    flex: 1,
    paddingTop: 10,
  },
  stepTitle: {
    fontSize: 15,
    color: '#333',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
});

export default RegisterScreen;
