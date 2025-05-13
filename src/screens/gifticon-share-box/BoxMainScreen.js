// 쉐어박스 메인 스크린

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../../components/ui';
import { Shadow } from 'react-native-shadow-2';
import { Icon } from 'react-native-elements';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../../api/config';
import apiClient from '../../api/apiClient';
import { fetchShareBoxes, joinShareBox } from '../../api/shareBoxApi';



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
  '#AF4AE1', // cardPurple
  '#157BEA', // cardBlue
  '#30B0C7', // cardTeal
  '#ED3EBB', // cardPink
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
    return require('../../assets/images/share_box_icon1.png');
  } else if (count <= 20) {
    return require('../../assets/images/share_box_icon2.png');
  } else {
    return require('../../assets/images/share_box_icon3.png');
  }
};

const BoxMainScreen = () => {
  const { theme } = useTheme();
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const navigation = useNavigation();
  const [shareBoxes, setShareBoxes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. 함수 선언 위치를 바깥으로!
  const loadShareBoxes = async () => {
    setLoading(true);
    try {
      const data = await fetchShareBoxes();
      setShareBoxes(data.shareBoxes || []);
    } catch (e) {
      setShareBoxes([]);
      Alert.alert('목록 불러오기 실패', '쉐어박스 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 2. useEffect/useFocusEffect에서 호출
  useEffect(() => {
    loadShareBoxes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadShareBoxes();
    }, [])
  );

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
  const handleConfirmPress = async () => {
    if (!inviteCode.trim()) {
      return;
    }

    try {
      const shareBoxId = inviteCode.trim();
      await joinShareBox(shareBoxId, inviteCode.trim());
      alert('쉐어박스에 성공적으로 참여하였습니다!');
      handleCloseModal();
      // TODO: 필요하다면 목록 새로고침 등 추가
    } catch (error) {
      let message = '참여에 실패했습니다. 다시 시도해 주세요.';
      const errorCode = error?.response?.data?.errorCode;
      switch (errorCode) {
        case 'SHAREBOX_003':
          message = '유효하지 않은 초대 코드입니다.';
          break;
        case 'X002':
          message = '잘못된 파라미터가 전달되었습니다.';
          break;
        case 'SHAREBOX_004':
          message = '참여가 비활성화된 쉐어박스입니다.';
          break;
        case 'SHAREBOX_006':
          message = '최대 참여자 수(10명)에 도달했습니다.';
          break;
        case 'SHAREBOX_001':
          message = '쉐어박스를 찾을 수 없습니다.';
          break;
        case 'SHAREBOX_005':
          message = '이미 참여 중인 쉐어박스입니다.';
          break;
        default:
          if (error?.response?.data?.message) {
            message = error.response.data.message;
          }
          break;
      }
      alert(message);
    }
  };

  // 쉐어박스 생성 버튼 클릭 핸들러
  const handleCreatePress = () => {
    // BoxCreateScreen으로 이동
    navigation.navigate('BoxCreate');
  };

  // 쉐어박스 카드 클릭 핸들러
  const handleBoxPress = item => {
    // BoxListScreen으로 이동
    navigation.navigate('BoxList', {
      shareBoxId: item.shareBoxId || Math.floor(Math.random() * 1000) + 1, // ID가 없는 경우 임의의 ID 생성
      shareBoxName: item.shareBoxName,
    });
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
              <Text
                variant="h3"
                weight="bold"
                style={styles.boxTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
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
                  {item.shareBoxUserName}
                </Text>
              </View>
            </View>

            {/* 중앙 영역 - 이미지와 카운트를 한 줄에 배치 */}
            <View style={styles.boxMiddleArea}>
              {/* 왼쪽에 카운트 표시 */}
              <View style={[styles.countContainer, { backgroundColor: `${cardColor}20` }]}>
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
                  {item.gifticonCount}
                </Text>
              </View>

              {/* 오른쪽에 이미지 배치 */}
              <View style={styles.boxImageArea}>
                <Image source={iconImage} style={styles.boxImage} resizeMode="contain" />
              </View>
            </View>
          </View>
        </Shadow>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 쉐어박스 목록 */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="h2" weight="bold" style={styles.headerTitle}>
            쉐어박스
          </Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinPress}
              activeOpacity={0.7}
            >
              <Text variant="body2" weight="medium" style={styles.joinButtonText}>
                참여
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePress}
              activeOpacity={0.7}
            >
              <Text variant="body2" weight="medium" style={styles.createButtonText}>
                생성
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.boxesContainer}>
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={theme.colors.primary || '#56AEE9'} />
            </View>
          ) : (
            shareBoxes.map((item, index) => renderShareBox(item, index))
          )}
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
              onChangeText={(text) => {
                // 영문(대소문자) 또는 숫자만 허용, 10자리로 자르기
                const filtered = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                setInviteCode(filtered);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              fontFamily="Pretendard-Regular"
              maxLength={10}
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
    paddingHorizontal: 2,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 15,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 24,
    marginLeft: 5,
    letterSpacing: -0.5,
    fontFamily: 'Pretendard-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  joinButton: {
    backgroundColor: '#E5F4FE',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 7,
  },
  joinButtonText: {
    color: '#56AEE9',
    fontFamily: 'Pretendard-Medium',
  },
  createButton: {
    backgroundColor: '#56AEE9',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard-Medium',
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
    borderRadius: 12,
    padding: 13,
    paddingBottom: 2,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  boxTopArea: {
    width: '100%',
  },
  boxTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 2,
    marginLeft: 1,
    color: '#000000',
    paddingRight: 5,
    fontFamily: 'Pretendard-Bold',
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
    marginBottom: 2,
    fontFamily: 'Pretendard-regular',
  },
  boxMiddleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 0,
  },
  boxImageArea: {
    marginTop: -10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  boxImage: {
    width: 60,
    height: 60,
    marginBottom: 2,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 7,
    alignSelf: 'flex-start',
  },
  boxCountIconContainer: {
    marginRight: 4,
    padding: 0,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Pretendard-Bold',
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
    fontFamily: 'Pretendard-Bold',
  },
  modalSubtitle: {
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Pretendard-Regular',
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
    fontFamily: 'Pretendard-Regular',
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
    fontFamily: 'Pretendard-Medium',
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
    fontFamily: 'Pretendard-Medium',
  },
});

export default BoxMainScreen;
