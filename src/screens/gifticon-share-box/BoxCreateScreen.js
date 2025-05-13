/* eslint-disable react-native/no-inline-styles */
// 쉐어박스 생성 스크린

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Clipboard,
  Alert,
  Share,
} from 'react-native';
import { Icon } from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import NavigationService from '../../navigation/NavigationService';
import apiClient from '../../api/apiClient';
import { API_CONFIG } from '../../api/config';

const BoxCreateScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // 쉐어박스 이름
  const [boxName, setBoxName] = useState('');
  // 초대 코드
  const [inviteCode, setInviteCode] = useState('');
  // 화면 상태 (create: 생성 화면, share: 코드 공유 화면)
  const [screenState, setScreenState] = useState('create');

  // 스타일 정의를 여기로 이동
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
    scrollContent: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareContentContainer: {
      width: '100%',
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      marginTop: 40,
      marginBottom: 30,
      alignItems: 'center',
    },
    shareImage: {
      width: 100,
      height: 100,
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    shareTextContainer: {
      alignItems: 'center',
      marginVertical: 30,
    },
    guideText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333333',
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 28,
      fontFamily: theme.fonts.fontWeight.bold,
    },
    subGuideText: {
      fontSize: 15,
      color: '#718096',
      textAlign: 'center',
      lineHeight: 22,
      fontFamily: theme.fonts.fontWeight.regular,
    },
    inputContainer: {
      width: '100%',
      marginBottom: 40,
    },
    input: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: '#FFFFFF',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    buttonContainer: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    rowButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    createButton: {
      height: 56,
      borderRadius: 10,
      backgroundColor: '#56AEE9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: '#A0AEC0',
      opacity: 0.6,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'semibold',
      fontFamily: theme.fonts.fontWeight.semiBold,
    },
    // 코드 공유 화면 스타일
    codeContainer: {
      width: '100%',
      backgroundColor: '#F0F9FF',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      marginTop: 30,
    },
    codeValue: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#000000',
      letterSpacing: 2,
      padding: 10,
      fontFamily: theme.fonts.fontWeight.bold,
    },
    copyButton: {
      flex: 1,
      height: 56,
      borderRadius: 10,
      backgroundColor: '#56AEE9',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    kakaoButton: {
      flex: 1,
      height: 56,
      borderRadius: 10,
      backgroundColor: '#FEE500',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    buttonText: {
      fontWeight: 'semiBold',
      fontSize: 16,
      color: '#FFFFFF',
      fontFamily: theme.fonts.fontWeight.semiBold,
    },
    kakaobuttonText: {
      fontWeight: 'regular',
      fontSize: 16,
      color: '#462000',
      fontFamily: theme.fonts.fontWeight.semiBold,
    },
    // 박스명 표시 버튼 스타일 (수정)
    boxInfoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 15,
      marginBottom: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    boxIcon: {
      marginRight: 4,
    },
    boxNameText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#56AEE9',
      fontFamily: theme.fonts.fontWeight.bold,
    },
  });

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    if (screenState === 'share') {
      // 코드 공유 화면에서 뒤로가기 시 메인 화면으로 이동
      NavigationService.goBack();
    } else {
      // 생성 화면에서 뒤로가기
      NavigationService.goBack();
    }
  };

  // 쉐어박스 생성 함수
  const handleCreate = async () => {
    if (!boxName.trim()) {
      // 이름이 비어있으면 생성 불가
      Alert.alert('알림', '박스명을 입력해주세요.');
      return;
    }

    try {
      // API 호출
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CREATE_SHARE_BOX, {
        shareBoxName: boxName.trim(),
      });
      setInviteCode(response.data.shareBoxInviteCode);
      setScreenState('share');
    } catch (error) {
      console.error('쉐어박스 생성 실패:', error);
      Alert.alert('생성 실패', '쉐어박스 생성 중 오류가 발생했습니다.');
    }
  };

  // 카카오톡 공유 함수
  const handleShareKakao = async () => {
    try {
      // 실제 구현에서는 카카오 SDK를 사용하겠지만, 여기서는 일반 공유 기능으로 대체
      await Share.share({
        message: `기프티콘 관리 서비스 아차차의 쉐어박스 '${boxName}'에 초대합니다! 지금 바로 참여해보세요. 초대 코드: ${inviteCode}`,
      });
    } catch (error) {
      Alert.alert('공유 실패', '공유하는 중 오류가 발생했습니다.');
    }
  };

  // 코드 복사 함수
  const handleCopyCode = () => {
    Clipboard.setString(inviteCode);
  };

  // 생성 화면 렌더링
  const renderCreateScreen = () => (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* 이미지 영역 */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/share_box.png')}
              style={styles.shareImage}
              resizeMode="contain"
            />
          </View>

          {/* 안내 텍스트 */}
          <View style={styles.textContainer}>
            <Text style={styles.guideText}>
              쉐어박스를 생성하고{'\n'}함께 나누는 기프티콘을 관리해봐요!
            </Text>
          </View>

          {/* 입력 영역 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="박스명을 입력하세요."
              placeholderTextColor="#A0AEC0"
              value={boxName}
              onChangeText={setBoxName}
              maxLength={10}
            />
          </View>
        </View>
      </ScrollView>

      {/* 생성 버튼 */}
      <View
        style={[styles.buttonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}
      >
        <TouchableOpacity
          style={[styles.createButton, !boxName.trim() ? styles.disabledButton : {}]}
          onPress={handleCreate}
          disabled={!boxName.trim()}
        >
          <Text style={styles.createButtonText}>생성</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // 코드 공유 화면 렌더링
  const renderShareScreen = () => (
    <>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.shareContentContainer}>
          {/* 초대 코드 표시 영역 */}
          <View style={styles.codeContainer}>
            {/* 박스명 표시 버튼 */}
            <View style={styles.boxInfoButton}>
              <MaterialIcons name="inventory-2" size={18} color="#56AEE9" style={styles.boxIcon} />
              <Text style={styles.boxNameText}>{boxName}</Text>
            </View>

            <Text style={styles.codeValue}>{inviteCode}</Text>
          </View>

          {/* 안내 텍스트 */}
          <View style={styles.shareTextContainer}>
            <Text style={styles.guideText}>
              위의 초대코드를 입력하면{'\n'}쉐어박스에 참여할 수 있어요.
            </Text>
            <Text style={styles.subGuideText}>
              쉐어박스 메인 페이지 상단에{'\n'}참여 버튼을 눌러 코드를 입력해주세요.
            </Text>
          </View>
        </View>
      </View>

      {/* 버튼 영역 - 하단에 고정 */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 20, borderTopWidth: 0 },
        ]}
      >
        <View style={styles.rowButtonContainer}>
          <TouchableOpacity style={styles.kakaoButton} onPress={handleShareKakao}>
            <Text style={styles.kakaobuttonText}>카카오톡 공유</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
            <Text style={styles.buttonText}>코드 복사</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          {screenState === 'create' ? '쉐어박스 생성' : '초대 코드'}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {screenState === 'create' ? renderCreateScreen() : renderShareScreen()}
    </View>
  );
};

export default BoxCreateScreen;
