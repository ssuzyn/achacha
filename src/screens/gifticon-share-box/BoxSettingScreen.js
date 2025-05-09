// 쉐어박스 설정 스크린

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import NavigationService from '../../navigation/NavigationService';

const BoxSettingScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute();

  // 쉐어박스 이름 가져오기
  const [shareBoxName, setShareBoxName] = useState(
    route.params?.shareBoxName || '오라차차 대성이네'
  );
  const [memberEntryEnabled, setMemberEntryEnabled] = useState(true);
  const shareBoxCode = 'WAZPI76R';

  // 멤버 목록
  const members = [
    { id: 1, name: '조대성', role: '방장' },
    { id: 2, name: '박준수', role: '멤버' },
    { id: 3, name: '신해인', role: '멤버' },
    { id: 4, name: '안수진', role: '멤버' },
    { id: 5, name: '정주은', role: '멤버' },
  ];

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 이름 변경 핸들러
  const handleNameChange = text => {
    setShareBoxName(text);
  };

  // 멤버 입장 토글 핸들러
  const toggleMemberEntry = () => {
    setMemberEntryEnabled(!memberEntryEnabled);
  };

  // 초대 코드 복사 핸들러
  const copyInviteCode = () => {
    // 클립보드에 코드 복사 로직 (실제 구현 필요)
  };

  // 쉐어박스 나가기 핸들러
  const leaveShareBox = () => {
    // 쉐어박스 나가기 로직 (실제 구현 필요)
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
          {/* 쉐어박스 이름 */}
          <View style={styles.section}>
            <Text variant="body1" weight="medium" style={styles.sectionLabel}>
              쉐어박스 이름
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={shareBoxName}
                onChangeText={handleNameChange}
                style={styles.input}
                placeholder="쉐어박스 이름을 입력하세요"
              />
              <TouchableOpacity style={styles.confirmButton}>
                <Text variant="body2" weight="medium" style={styles.confirmButtonText}>
                  변경
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 멤버 입장 */}
          <View style={styles.section}>
            <View style={styles.rowContainer}>
              <Text variant="body1" weight="medium">
                멤버 입장 허용
              </Text>
              <TouchableOpacity
                style={[
                  styles.switchContainer,
                  {
                    backgroundColor: memberEntryEnabled ? '#C9EAFC' : 'white',
                    borderColor: memberEntryEnabled ? '#83C8F5' : '#A7DAF9',
                  },
                ]}
                onPress={toggleMemberEntry}
              >
                <View
                  style={[
                    styles.switchThumb,
                    {
                      backgroundColor: memberEntryEnabled ? '#83C8F5' : '#A7DAF9',
                      transform: [{ translateX: memberEntryEnabled ? 22 : 2 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 쉐어박스 초대 코드 */}
          <View style={styles.section}>
            <Text variant="body1" weight="medium" style={styles.sectionTitle}>
              쉐어박스 초대 코드
            </Text>
            <View style={[styles.codeContainer, { backgroundColor: '#F0F9FF' }]}>
              <Text variant="h3" weight="bold" style={styles.codeText}>
                {shareBoxCode}
              </Text>
              <TouchableOpacity style={styles.confirmButton} onPress={copyInviteCode}>
                <Text variant="body2" weight="medium" style={styles.confirmButtonText}>
                  복사
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 멤버 목록 */}
          <View style={styles.section}>
            <Text variant="body1" weight="medium" style={styles.sectionTitle}>
              멤버 목록
            </Text>
            {members.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <Text variant="body1">{member.name}</Text>
                <Text variant="body2" style={styles.memberRole}>
                  {member.role}
                </Text>
              </View>
            ))}
          </View>

          {/* 쉐어박스 나가기 버튼 */}
          <TouchableOpacity style={styles.leaveButton} onPress={leaveShareBox}>
            <Text variant="body1" weight="medium" style={styles.leaveButtonText}>
              쉐어박스 나가기
            </Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  editButton: {
    marginLeft: 8,
  },
  editButtonText: {
    color: '#007AFF',
  },
  switchContainer: {
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 20,
  },
  copyButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  copyButtonText: {
    color: '#007AFF',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  memberRole: {
    color: '#666666',
  },
  leaveButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  leaveButtonText: {
    color: '#FF3B30',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  confirmButton: {
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
});

export default BoxSettingScreen;
