// 기프티콘 등록 스크린

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { Text } from '../../components/ui';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';

const RegisterScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 수동 등록 처리
  const handleManualRegister = useCallback(() => {
    // 수동 등록 화면으로 이동
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
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 등록
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 업로드 카드 */}
        <Shadow
          distance={10}
          startColor={'rgba(0, 0, 0, 0.028)'}
          offset={[0, 1]}
          style={styles.shadowContainer}
        >
          <Card style={styles.uploadCard}>
            <View style={styles.uploadContent}>
              <Image
                source={require('../../assets/images/gifticon-upload.png')}
                style={styles.uploadIcon}
                resizeMode="contain"
              />
              <Text variant="h2" weight="bold" style={styles.uploadTitleMargin}>
                기프티콘 업로드
              </Text>
              <Text variant="h5" weight="regular" color="#718096" style={styles.textCenter}>
                지금 바로 갤러리에 저장된
              </Text>
              <Text variant="h5" weight="regular" color="#718096" style={styles.textCenter}>
                기프티콘을 업로드 해보세요.
              </Text>
            </View>
          </Card>
        </Shadow>

        {/* 수동 등록 버튼 - TouchableOpacity로 간단하게 구현 */}
        <TouchableOpacity style={styles.manualButton} onPress={handleManualRegister}>
          <Text variant="h4" weight="semiBold" color="white" style={styles.manualTextMain}>
            수동 등록
          </Text>
          <Text variant="body2" weight="regular" color="white" style={styles.manualTextSub}>
            등록에 문제가 발생하셨나요?
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 등록하신 기프티콘은... 섹션 */}
        <View style={styles.infoSection}>
          <Text variant="h2" weight="bold">
            등록하신 기프티콘은
          </Text>
          <Text variant="h2" weight="bold">
            다음과 같은 절차를 통해 관리돼요.
          </Text>
        </View>

        {/* 절차 스텝 */}
        <View style={styles.stepsContainer}>
          {/* 스텝 1 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: theme.colors.tertiary }]}>
              <Text variant="h3" weight="bold" color="white">
                1
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="regular">
                갤러리에 저장된 기프티콘을
              </Text>
              <Text variant="body1" weight="regular">
                앱에 업로드해요.
              </Text>
            </View>
          </View>

          {/* 스텝 2 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: theme.colors.primary }]}>
              <Text variant="h3" weight="bold" color="white">
                2
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="regular">
                OCR 기술을 통해
              </Text>
              <Text variant="body1" weight="regular">
                브랜드, 상품, 유효기간을 모두 저장해요.
              </Text>
            </View>
          </View>

          {/* 스텝 3 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: theme.colors.secondary }]}>
              <Text variant="h3" weight="bold" color="white">
                3
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="body1" weight="regular">
                이렇게 저장된 기프티콘은
              </Text>
              <Text variant="body1" weight="regular">
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
    paddingTop: 30,
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
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 48,
  },
  uploadCard: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 2,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 90,
    height: 90,
    marginBottom: 18,
  },
  uploadTitleMargin: {
    marginBottom: 10,
  },
  textCenter: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 2,
  },
  manualButton: {
    backgroundColor: '#BBC1D0',
    borderRadius: 10,
    height: 65,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  manualTextMain: {
    marginBottom: 0,
  },
  manualTextSub: {
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 20,
    marginBottom: 30,
  },
  infoSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
    paddingTop: 5,
  },
  shadowContainer: {
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
});

export default RegisterScreen;
