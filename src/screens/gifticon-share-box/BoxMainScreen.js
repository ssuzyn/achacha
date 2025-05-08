// 쉐어박스 메인 스크린

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../../components/ui';
import { Shadow } from 'react-native-shadow-2';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

// 샘플 데이터
const DUMMY_DATA = {
  data: [
    {
      shareBoxName: '우리 가족',
      hostName: '박쭈',
      gifticonCount: 0,
    },
    {
      shareBoxName: '내 친구들',
      hostName: '조대성MM',
      gifticonCount: 12,
    },
    {
      shareBoxName: '자율 PJT',
      hostName: '안수진짜',
      gifticonCount: 15,
    },
    {
      shareBoxName: '잘 사용하세요',
      hostName: '류잼문',
      gifticonCount: 30,
    },
    {
      shareBoxName: '대학동기들',
      hostName: '스티치짱',
      gifticonCount: 34,
    },
    {
      shareBoxName: '배고파요',
      hostName: '정주은갈치',
      gifticonCount: 7,
    },
    {
      shareBoxName: '우리만의 쉐어박스',
      hostName: '김철수',
      gifticonCount: 212,
    },
    {
      shareBoxName: '쉐박쉐박',
      hostName: '김민수',
      gifticonCount: 1,
    },
  ],
  hasNextPage: true,
  nextPage: 'MTI1',
};

// 배경색 배열 - Theme에서 가져온 색상에 30% 투명도 적용
const BACKGROUND_COLORS = [
  'rgba(255, 149, 0, 0.1)', // cardOrange with 30% opacity
  'rgba(13, 186, 63, 0.1)', // cardGreen with 30% opacity
  'rgba(175, 82, 222, 0.1)', // cardPurple with 30% opacity
  'rgba(0, 122, 255, 0.1)', // cardBlue with 30% opacity
  'rgba(48, 176, 199, 0.1)', // cardTeal with 30% opacity
  'rgba(255, 45, 196, 0.1)', // cardPink with 30% opacity
];

// 아이콘 색상 배열 - 불투명 색상
const CARD_COLORS = [
  '#FF9500', // cardOrange
  '#0DBA3F', // cardGreen
  '#AF52DE', // cardPurple
  '#007AFF', // cardBlue
  '#30B0C7', // cardTeal
  '#FF2DC3', // cardPink
];

// 아이콘 이름 매핑
const MATERIAL_ICONS = {
  box: 'inventory-2',
  person: 'person',
  count: 'local-mall',
};

// 기프티콘 수에 따른 아이콘 선택 함수
const getShareBoxIcon = count => {
  if (count <= 10) {
    return require('../../assets/images/share-box-icon1.png');
  } else if (count <= 20) {
    return require('../../assets/images/share-box-icon2.png');
  } else {
    return require('../../assets/images/share-box-icon3.png');
  }
};

const BoxMainScreen = () => {
  const { theme } = useTheme();
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const navigation = useNavigation();

  // 쉐어박스 참여 버튼 클릭 핸들러
  const handleJoinPress = () => {
    setIsJoinModalVisible(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsJoinModalVisible(false);
    setInviteCode('');
  };

  // 취소 버튼 핸들러
  const handleCancelPress = () => {
    handleCloseModal();
  };

  // 확인 버튼 핸들러
  const handleConfirmPress = () => {
    if (!inviteCode.trim()) {
      return;
    }

    // TODO: 초대코드 검증 및 참여 로직 구현
    console.log('입력된 초대코드:', inviteCode);
    handleCloseModal();
  };

  // 쉐어박스 생성 버튼 클릭 핸들러
  const handleCreatePress = () => {
    // BoxCreateScreen으로 이동
    navigation.navigate('BoxCreate');
  };

  // 쉐어박스 카드 클릭 핸들러
  const handleBoxPress = item => {
    // TODO: 쉐어박스 상세 화면으로 이동
    console.log('선택된 쉐어박스:', item.shareBoxName);
  };

  // 쉐어박스 카드 렌더링
  const renderShareBox = (item, index) => {
    // 배경색과 아이콘 색상 설정
    const backgroundColor = BACKGROUND_COLORS[index % BACKGROUND_COLORS.length];
    const cardColor = CARD_COLORS[index % CARD_COLORS.length];

    // 기프티콘 수에 따른 아이콘 선택
    const iconImage = getShareBoxIcon(item.gifticonCount);

    return (
      <TouchableOpacity
        key={index}
        style={styles.boxWrapper}
        onPress={() => handleBoxPress(item)}
        activeOpacity={0.8}
      >
        <Shadow
          distance={12}
          startColor={'rgba(0, 0, 0, 0.008)'}
          offset={[0, 1]}
          style={styles.shadowContainer}
        >
          <View style={[styles.boxCard, { backgroundColor }]}>
            {/* 상단 정보 영역 */}
            <View style={styles.boxTopArea}>
              {/* 박스명 */}
              <Text variant="h3" weight="bold" style={styles.boxTitle}>
                {item.shareBoxName}
              </Text>

              {/* 호스트 정보 */}
              <View style={styles.roleContainer}>
                <Icon
                  name={MATERIAL_ICONS.person}
                  type="material"
                  size={17}
                  color="#718096"
                  containerStyle={styles.personIconContainer}
                />
                <Text variant="body2" weight="semibold" style={styles.boxRole}>
                  {item.hostName}
                </Text>
              </View>
            </View>

            {/* 중앙 이미지 영역 */}
            <View style={styles.boxImageArea}>
              <Image source={iconImage} style={styles.boxImage} resizeMode="contain" />
            </View>

            {/* 하단 카운트 영역 */}
            <View style={styles.boxBottomArea}>
              <View style={[styles.countContainer, { backgroundColor: `${cardColor}30` }]}>
                <Icon
                  name={MATERIAL_ICONS.box}
                  type="material"
                  size={16}
                  color={cardColor}
                  containerStyle={styles.boxCountIconContainer}
                />
                <Text
                  variant="body2"
                  weight="semibold"
                  style={[styles.countText, { color: `${cardColor}` }]}
                >
                  {item.gifticonCount}개 쉐어 중
                </Text>
              </View>
            </View>
          </View>
        </Shadow>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text variant="h2" weight="bold" style={styles.headerTitle}>
          쉐어박스
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinPress} activeOpacity={0.7}>
            <Text variant="body1" weight="medium" style={styles.joinButtonText}>
              참여
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreatePress}
            activeOpacity={0.7}
          >
            <Text variant="body1" weight="medium" style={styles.createButtonText}>
              생성
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 쉐어박스 목록 */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.boxesContainer}>
          {DUMMY_DATA.data.map((item, index) => renderShareBox(item, index))}
        </View>
      </ScrollView>

      {/* 초대코드 입력 모달 */}
      <Modal
        visible={isJoinModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text variant="h3" weight="bold" style={styles.modalTitle}>
              초대코드 입력하기
            </Text>
            <Text variant="body2" style={styles.modalSubtitle}>
              초대받은 쉐어박스에 참여하려면{'\n'}공유받은 초대코드를 입력해 주세요.
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder="초대코드"
              placeholderTextColor="#A0AEC0"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelPress}
                activeOpacity={0.7}
              >
                <Text variant="body1" weight="medium" style={styles.cancelButtonText}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmPress}
                activeOpacity={0.7}
              >
                <Text variant="body1" weight="medium" style={styles.confirmButtonText}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  joinButton: {
    backgroundColor: '#E5F4FE',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  joinButtonText: {
    color: '#56AEE9',
  },
  createButton: {
    backgroundColor: '#56AEE9',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  boxesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  boxWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  shadowContainer: {
    borderRadius: 12,
    width: '100%',
  },
  boxCard: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    padding: 13,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  boxTopArea: {
    width: '100%',
  },
  boxTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 2,
    color: '#000000',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personIconContainer: {
    marginRight: 2,
    padding: 0,
  },
  boxRole: {
    color: '#718096',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  boxImageArea: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 1,
  },
  boxImage: {
    width: 70,
    height: 70,
  },
  boxBottomArea: {
    width: '100%',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  boxCountIconContainer: {
    marginRight: 4,
    padding: 0,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  codeInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A5568',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#56AEE9',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default BoxMainScreen;
