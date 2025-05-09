// PresentScreen.js - 선물하기 화면

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  // 현재 width는 사용하지 않지만 향후 확장성을 위해 import 유지
  Dimensions,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useTabBar } from '../../context/TabBarContext';
import NavigationService from '../../navigation/NavigationService';

// eslint-disable-next-line no-unused-vars
const { width } = Dimensions.get('window');

const PresentScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  // eslint-disable-next-line no-unused-vars
  const navigation = useNavigation(); // 네비게이션 객체는 handleGift 함수 내 사용
  const route = useRoute();
  const { hideTabBar } = useTabBar();

  // 템플릿 썸네일 목록 (고정 값이라 상태 변경자는 사용하지 않음)
  const [thumbnails] = useState([
    { id: 1, source: require('../../assets/images/present/thumbnail/thumbnail1.png') },
    { id: 2, source: require('../../assets/images/present/thumbnail/thumbnail2.png') },
    { id: 3, source: require('../../assets/images/present/thumbnail/thumbnail3.png') },
    { id: 4, source: require('../../assets/images/present/thumbnail/thumbnail4.png') },
    { id: 5, source: require('../../assets/images/present/thumbnail/thumbnail5.png') },
  ]);

  // 선택된 템플릿 ID
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);

  // 템플릿 배경 이미지 목록 (고정 값이라 상태 변경자는 사용하지 않음)
  const [templates] = useState({
    1: require('../../assets/images/present/template/template1-1.png'),
    2: require('../../assets/images/present/template/template2.png'),
    3: require('../../assets/images/present/template/template3.png'),
    4: require('../../assets/images/present/template/template4.png'),
    5: require('../../assets/images/present/template/template5.png'),
  });

  // 첫 번째 템플릿의 색상 변형 이미지들
  const template1Variants = [
    {
      id: 1,
      source: require('../../assets/images/present/template/template1-1.png'),
      color: '#ED4141',
    },
    {
      id: 2,
      source: require('../../assets/images/present/template/template1-2.png'),
      color: '#FFDC4F',
    },
    {
      id: 3,
      source: require('../../assets/images/present/template/template1-3.png'),
      color: '#FC7BBD',
    },
    {
      id: 4,
      source: require('../../assets/images/present/template/template1-4.png'),
      color: '#68DB7D',
    },
    {
      id: 5,
      source: require('../../assets/images/present/template/template1-5.png'),
      color: '#85D1FF',
    },
    {
      id: 6,
      source: require('../../assets/images/present/template/template1-6.png'),
      color: '#414141',
    },
  ];

  // 선택된 템플릿 색상 변형 (템플릿 1에서만 사용)
  const [selectedColorVariant, setSelectedColorVariant] = useState(1);

  // 기프티콘 데이터
  const [gifticonData, setGifticonData] = useState(null);

  // 사용자 메시지
  const [message, setMessage] = useState('');

  // 탭바 숨기기
  useEffect(() => {
    hideTabBar();

    return () => {
      // 화면 벗어날 때 필요한 정리 작업
    };
  }, [hideTabBar]);

  // 기프티콘 데이터 가져오기
  useEffect(() => {
    if (route.params?.gifticonId) {
      // 실제 구현에서는 API 호출
      // 더미 데이터로 대체
      setGifticonData({
        id: route.params.gifticonId,
        name: '맥도날드 2만원 금액권',
        brandName: '맥도날드',
        thumbnailPath: require('../../assets/images/dummy-mc.png'),
      });
    }
  }, [route.params]);

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 템플릿 선택 처리 함수
  const handleSelectTemplate = id => {
    setSelectedTemplateId(id);
    // 템플릿 1이 아닌 경우 색상 변형 리셋
    if (id !== 1) {
      setSelectedColorVariant(1);
    }
  };

  // 색상 변형 선택 처리 함수
  const handleSelectColorVariant = variantId => {
    setSelectedColorVariant(variantId);
  };

  // 갤러리에 저장 처리 함수
  const handleSaveToGallery = () => {
    Alert.alert('갤러리 저장', '갤러리에 이미지가 저장되었습니다.');
  };

  // 선물하기 처리 함수
  const handleSendGift = () => {
    Alert.alert('선물하기', '선물이 성공적으로 전송되었습니다.');
    // 선물 성공 후 뒤로 가기
    setTimeout(() => {
      NavigationService.goBack();
    }, 1500);
  };

  // 현재 선택된 템플릿 이미지 가져오기
  const getSelectedTemplateImage = () => {
    if (selectedTemplateId === 1) {
      // 템플릿 1은 색상 변형이 있음
      const variant = template1Variants.find(v => v.id === selectedColorVariant);
      return variant ? variant.source : template1Variants[0].source;
    }
    return templates[selectedTemplateId];
  };

  // 렌더링 템플릿 썸네일 아이템
  const renderThumbnailItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.thumbnailItem, selectedTemplateId === item.id && styles.selectedThumbnailItem]}
      onPress={() => handleSelectTemplate(item.id)}
    >
      <Image source={item.source} style={styles.thumbnailImage} resizeMode="contain" />
    </TouchableOpacity>
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
          기프티콘 선물
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 템플릿 썸네일 리스트 */}
        <View style={styles.thumbnailSection}>
          <FlatList
            data={thumbnails}
            renderItem={renderThumbnailItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        </View>

        {/* 템플릿 카드 영역 - 새로운 레이아웃 */}
        <View style={styles.templateCardSection}>
          <View style={styles.templateCard}>
            {/* 템플릿 배경 이미지 */}
            <Image
              source={getSelectedTemplateImage()}
              style={styles.templateBackgroundImage}
              resizeMode="cover"
            />

            {/* 상단 여백 */}
            <View style={styles.topPadding} />

            {/* 메시지 입력 영역 - 흰색 카드 */}
            <View style={styles.messageInputCard}>
              <TextInput
                style={styles.messageInput}
                placeholder="텍스트를 입력하세요."
                placeholderTextColor="#767676"
                multiline
                value={message}
                onChangeText={setMessage}
                maxLength={100}
              />
            </View>

            {/* 점선 구분선 */}
            <View style={styles.dashedLine} />

            {/* 기프티콘 이미지 영역 - 흰색 카드 */}
            <View style={styles.gifticonCard}>
              {/* 기프티콘 이미지 영역 */}
              <View style={styles.gifticonImageContainer}>
                {gifticonData && (
                  <Image
                    source={gifticonData.thumbnailPath}
                    style={styles.gifticonImage}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* 갤러리에 저장 버튼 */}
              <TouchableOpacity style={styles.galleryButton} onPress={handleSaveToGallery}>
                <Text style={styles.galleryButtonText}>갤러리에 저장</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 색상 선택 팔레트 (템플릿 1에서만 표시) */}
          {selectedTemplateId === 1 && (
            <View style={styles.colorPaletteContainer}>
              {template1Variants.map(variant => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: variant.color },
                    selectedColorVariant === variant.id && styles.selectedColorOption,
                  ]}
                  onPress={() => handleSelectColorVariant(variant.id)}
                />
              ))}
            </View>
          )}

          {/* 선물하기 버튼 영역 - 별도로 유지 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendGift}>
              <Text style={styles.sendButtonText}>선물하기</Text>
            </TouchableOpacity>
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
  thumbnailSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  thumbnailList: {
    paddingHorizontal: 16,
  },
  thumbnailItem: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedThumbnailItem: {
    borderColor: '#56AEE9',
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: 80,
  },
  templateCardSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  templateCard: {
    position: 'relative',
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    aspectRatio: 0.66, // 더 긴 세로 비율
  },
  templateBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  // 상단 여백
  topPadding: {
    height: '25%', // 상단 30% 공간을 비움
  },
  // 메시지 입력 카드 스타일
  messageInputCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
  },
  messageInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    height: 80,
  },
  // 점선 구분선 스타일
  dashedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#777',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  // 기프티콘 카드 스타일
  gifticonCard: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  gifticonImageContainer: {
    width: '80%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#72BFFF',
    borderRadius: 8,
    padding: 0,
    marginBottom: 15,
  },
  gifticonImage: {
    width: 120,
    height: 70,
    resizeMode: 'contain',
  },
  galleryButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#E5F4FE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    color: '#278CCC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#56AEE9',
  },
  buttonContainer: {
    marginTop: 20,
  },
  sendButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: '#56AEE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PresentScreen;
