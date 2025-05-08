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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import NavigationService from '../../navigation/NavigationService';

const BoxCreateScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // 쉐어박스 이름
  const [boxName, setBoxName] = useState('');

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 쉐어박스 생성 함수
  const handleCreate = () => {
    if (!boxName.trim()) {
      // 이름이 비어있으면 생성 불가
      alert('박스명을 입력해주세요.');
      return;
    }

    // TODO: API 호출로 쉐어박스 생성 로직 구현
    console.log('쉐어박스 생성:', boxName);

    // 생성 후 메인 화면으로 이동
    NavigationService.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          쉐어박스 생성
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

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
              source={require('../../assets/images/share-box-icon3.png')}
              style={styles.shareImage}
              resizeMode="contain"
            />
          </View>

          {/* 안내 텍스트 */}
          <View style={styles.textContainer}>
            <Text style={styles.guideText}>
              쉐어박스를 생성하고{'\n'}친구에게 코드를 공유해보세요.
            </Text>
            <Text style={styles.subGuideText}>
              쉐어박스 메인 페이지 상단에{'\n'}초대코드를 입력하면 친구와 함께 즐길 수 있어요!
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
              maxLength={20}
            />
          </View>
        </View>
      </ScrollView>

      {/* 생성 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, !boxName.trim() ? styles.disabledButton : {}]}
          onPress={handleCreate}
          disabled={!boxName.trim()}
        >
          <Text variant="body1" weight="bold" style={styles.createButtonText}>
            생성
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  shareImage: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  guideText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  subGuideText: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
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
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
  },
});

export default BoxCreateScreen;
