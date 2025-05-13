// 기프티콘 조회 스크린

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components/ui';
import AlertDialog from '../../components/ui/AlertDialog';
import CategoryTabs from '../../components/common/CategoryTabs';
import TabFilter from '../../components/common/TabFilter';
import { useTheme } from '../../hooks/useTheme';
import { Shadow } from 'react-native-shadow-2';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import gifticonService from '../../api/gifticonService';
import FastImage from 'react-native-fast-image';

const ManageListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  // route.params에서 initialTab을 가져와 초기 탭 설정
  const initialTab = route.params?.initialTab || 'mybas';

  // 카테고리 상태 - 초기값은 route.params에서 받은 initialTab으로 설정
  const [selectedCategory, setSelectedCategory] = useState(initialTab);
  // 필터 상태
  const [selectedFilter, setSelectedFilter] = useState('all');
  // 정렬 상태
  const [sortBy, setSortBy] = useState({
    mybas: 'recent',
    sharebas: 'recent',
    used: 'recent',
  });
  // 정렬 드롭다운 표시 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // 필터링된 기프티콘 상태
  const [filteredGifticons, setFilteredGifticons] = useState([]);

  // API 호출 관련 상태 추가
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  // 카테고리 탭 데이터
  const categories = [
    { id: 'mybas', name: '마이박스' },
    { id: 'sharebas', name: '쉐어박스' },
    { id: 'used', name: '사용완료' },
  ];

  // 필터 탭 데이터
  const filterTabs = [
    { id: 'all', title: '전체', width: 45 },
    { id: 'product', title: '상품형', width: 55 },
    { id: 'amount', title: '금액형', width: 55 },
  ];

  // 정렬 옵션
  const sortOptions = [
    { id: 'recent', title: '등록순' },
    { id: 'expiry', title: '임박순' },
  ];

  // 사용완료 탭 정렬 옵션
  const usedSortOptions = [{ id: 'recent', title: '사용순' }];

  // 현재 로그인한 사용자의 ID (실제 구현에서는 context나 state에서 가져옴)
  const currentUserId = 78;

  // 스타일 정의를 여기로 이동
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 2,
      paddingTop: 0,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 0,
    },
    tabFilterContainer: {
      flex: 1,
    },
    sortContainer: {
      position: 'relative',
      zIndex: 1,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    sortButtonText: {
      fontSize: 14,
      marginRight: 5,
      color: '#333',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    sortDropdown: {
      position: 'absolute',
      top: 40,
      right: 0,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      width: 160,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sortOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    sortOptionText: {
      fontSize: 14,
      color: '#333',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    sortOptionTextSelected: {
      color: '#56AEE9',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    scrollView: {
      flex: 1,
      marginTop: 5,
    },
    scrollViewContent: {
      paddingTop: 0,
      paddingBottom: 30,
    },
    gifticonList: {
      paddingVertical: 1,
    },
    shadowContainer: {
      width: '100%',
      borderRadius: 12,
      marginBottom: 10,
    },
    gifticonItem: {
      width: '100%',
    },
    gifticonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      // paddingBottom: 5,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      position: 'relative', // D-day 태그의 절대 위치를 위해 필요
    },
    imageContainer: {
      marginRight: 10,
    },
    gifticonImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    textContainer: {
      flex: 1,
    },
    brandText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 1,
      fontFamily: theme.fonts.fontWeight.bold,
    },
    nameText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 2,
      paddingRight: 80, // D-day 태그를 위한 여백 확보
      fontFamily: theme.fonts.fontWeight.regular,
    },
    dDayContainer: {
      position: 'absolute',
      right: 15,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 6,
    },
    urgentDDay: {
      backgroundColor: 'rgba(234, 84, 85, 0.15)',
    },
    normalDDay: {
      backgroundColor: 'rgba(114, 191, 255, 0.15)',
    },
    dDayText: {
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    urgentDDayText: {
      color: '#EA5455',
    },
    normalDDayText: {
      color: '#72BFFF',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    emptyText: {
      fontSize: 16,
      color: '#737373',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    sharedByText: {
      fontSize: 12,
      color: '#737373',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    shareBoxInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 0,
    },
    shareBoxIcon: {
      marginRight: 3,
    },
    shareBoxText: {
      fontSize: 12,
      color: '#278CCC',
      fontWeight: 'bold',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    // 스와이프 액션 관련 스타일
    leftAction: {
      width: 100, // 1/3 정도 보이도록 너비 조정
      backgroundColor: '#4CAF50', // 초록색 계열
      justifyContent: 'center',
      marginBottom: 10,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    rightAction: {
      width: '100', // 1/3 정도 보이도록 너비 조정
      backgroundColor: '#278CCC', // 파란색 계열
      justifyContent: 'center',
      marginBottom: 10,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    actionButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
    },
    actionText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4,
      fontFamily: theme.fonts.fontWeight.semiBold,
    },
    // 북마크 컨테이너 스타일 추가
    bookmarkContainer: {
      position: 'absolute',
      top: -2,
      left: 12,
      zIndex: 10,
    },
    expiredDDay: {
      backgroundColor: 'rgba(153, 153, 153, 0.15)',
    },
    expiredDDayText: {
      color: '#737373',
      fontWeight: 'bold',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    // 로딩 인디케이터 스타일 추가
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: '#EA5455',
      fontSize: 16,
      fontFamily: theme.fonts.fontWeight.medium,
      textAlign: 'center',
      marginBottom: 15,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#278CCC',
      borderRadius: 8,
    },
    retryText: {
      color: 'white',
      fontSize: 14,
      fontFamily: theme.fonts.fontWeight.medium,
    },
  });

  // 파라미터에서 initialTab이 변경되면 selectedCategory 업데이트
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedCategory(route.params.initialTab);
      // 사용완료 탭으로 변경 시 정렬 옵션도 변경
      if (route.params.initialTab === 'used') {
        setSortBy(prev => ({
          ...prev,
          [route.params.initialTab]: 'recent',
        }));
      }
      // 카테고리 변경 시 필터를 항상 '전체'로 초기화
      setSelectedFilter('all');
    }
  }, [route.params?.initialTab]);

  // 카테고리 변경 시 정렬 옵션 초기화
  useEffect(() => {
    if (selectedCategory === 'used') {
      setSortBy(prev => ({
        ...prev,
        [selectedCategory]: 'recent',
      }));
    }
  }, [selectedCategory]);

  // 카테고리, 필터, 정렬 변경 시 데이터 로드
  useEffect(() => {
    loadGifticons(true);
  }, [selectedCategory, selectedFilter, sortBy]);

  // 기프티콘 목록 로드 함수
  const loadGifticons = async (reset = false) => {
    if (loading && !reset) return; // 이미 로딩 중이고 초기화가 아니면 중지

    try {
      setLoading(true);
      setError(null);

      if (reset) {
        setNextPage(null);
        setFilteredGifticons([]);
      }

      // API 호출 파라미터 구성
      const params = {
        page: reset ? 0 : nextPage,
        size: 10,
      };

      // 필터 적용
      if (selectedFilter !== 'all') {
        params.type = selectedFilter.toUpperCase();
      }

      // 정렬 적용
      const currentSortBy = sortBy[selectedCategory];
      if (selectedCategory === 'used') {
        // 사용 완료 기프티콘 조회 시 'USED_DESC' 정렬 사용
        params.sort = 'USED_DESC';
      } else {
        // 사용 가능 기프티콘 조회 시 기존 정렬 사용
        params.sort = currentSortBy === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC';
      }

      console.log(
        `[ManageListScreen] 기프티콘 목록 로드 시작 - 카테고리: ${selectedCategory}, 필터: ${selectedFilter}, 정렬: ${params.sort}`
      );

      // 카테고리에 따라 API 호출 분기
      let response;
      if (selectedCategory === 'used') {
        // 사용 완료 기프티콘 조회
        console.log('[ManageListScreen] 사용 완료 기프티콘 조회 API 요청:', params);
        response = await gifticonService.getUsedGifticons(params);
      } else {
        // 사용 가능 기프티콘 조회
        params.scope =
          selectedCategory === 'mybas'
            ? 'MY_BOX'
            : selectedCategory === 'sharebas'
              ? 'SHARE_BOX'
              : 'ALL';
        console.log('[ManageListScreen] 사용 가능 기프티콘 조회 API 요청:', params);
        response = await gifticonService.getAvailableGifticons(params);
      }

      console.log('[ManageListScreen] API 응답 데이터:', response);

      if (!response || !response.gifticons) {
        console.error('[ManageListScreen] API 응답에 기프티콘 데이터가 없습니다:', response);
        setError('서버에서 응답은 받았으나 유효한 데이터가 없습니다.');
        return;
      }

      // 결과 처리
      const newGifticons = response.gifticons || [];
      console.log(`[ManageListScreen] 조회된 기프티콘 수: ${newGifticons.length}`);

      setFilteredGifticons(prev => (reset ? newGifticons : [...prev, ...newGifticons]));
      setHasNextPage(response.hasNextPage || false);
      setNextPage(response.nextPage || null);
    } catch (err) {
      console.error('[ManageListScreen] 기프티콘 목록 로드 실패:', err);

      // 네트워크 오류 세부 정보 로깅
      if (err.response) {
        // 서버 응답이 있는 경우 (4xx, 5xx 에러)
        console.error(`[ManageListScreen] 서버 오류 응답 - 상태 코드: ${err.response.status}`);
        console.error('[ManageListScreen] 오류 데이터:', err.response.data);
        setError(`서버 오류가 발생했습니다 (${err.response.status}). 잠시 후 다시 시도해주세요.`);
      } else if (err.request) {
        // 요청은 보냈지만 응답이 없는 경우 (네트워크 오류)
        console.error('[ManageListScreen] 네트워크 오류 - 서버 응답 없음');
        setError('네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.');
      } else {
        // 요청 자체가 실패한 경우
        console.error('[ManageListScreen] 요청 설정 오류:', err.message);
        setError('기프티콘 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 초기화인 경우 빈 목록 설정
      if (reset) {
        setFilteredGifticons([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = () => {
    setRefreshing(true);
    loadGifticons(true);
  };

  // 더 불러오기 처리
  const handleLoadMore = () => {
    if (hasNextPage && !loading) {
      loadGifticons();
    }
  };

  // 에러 시 재시도 처리
  const handleRetry = () => {
    loadGifticons(true);
  };

  // 카테고리 변경 처리
  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId);
    // 카테고리 변경 시 필터를 항상 '전체'로 초기화
    setSelectedFilter('all');
  };

  // 필터 변경 처리
  const handleFilterChange = filterId => {
    setSelectedFilter(filterId);
  };

  // 정렬 변경 처리
  const handleSortChange = sortId => {
    // 현재 선택된 카테고리에 대한 정렬만 변경
    setSortBy(prev => ({
      ...prev,
      [selectedCategory]: sortId,
    }));
    setShowSortDropdown(false);
  };

  // 정렬 드롭다운 토글
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // 외부 클릭 감지를 위한 이벤트 리스너 설정을 React Native 스타일로 변경
  const handleOutsidePress = () => {
    if (showSortDropdown) {
      setShowSortDropdown(false);
    }
  };

  // 날짜 차이 계산 함수
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 설정
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // 만료 날짜의 시간을 00:00:00으로 설정

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return '만료됨';
    } else if (diffDays === 0) {
      return 'D-day';
    }
    return diffDays;
  };

  // 날짜 포맷 함수
  const formatDate = dateString => {
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  // AlertDialog 상태 관리
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);

  // 바코드 조회 처리
  const handleBarcodeView = item => {
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('UseProductScreen', {
        id: item.gifticonId,
        barcodeNumber: item.gifticonId + '-' + Math.floor(Math.random() * 10000000), // 임시 바코드 번호
        brandName: item.brandName,
        gifticonName: item.gifticonName,
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('UseAmountScreen', {
        id: item.gifticonId,
        barcodeNumber: item.gifticonId + '-' + Math.floor(Math.random() * 10000000), // 임시 바코드 번호
        brandName: item.brandName,
        gifticonName: item.gifticonName,
      });
    }
  };

  // 사용 완료 다이얼로그 표시
  const showUseCompleteDialog = item => {
    setSelectedGifticon(item);
    setDialogVisible(true);
  };

  // 사용 완료 처리
  const handleMarkAsUsed = async () => {
    if (!selectedGifticon) return;

    try {
      setLoading(true);

      // API 호출로 기프티콘을 사용완료 상태로 변경
      await gifticonService.markGifticonAsUsed(selectedGifticon.gifticonId, 'SELF_USE');

      console.log('기프티콘 사용완료 처리 성공:', selectedGifticon.gifticonId);

      // 상태 업데이트 및 화면 갱신
      const updatedGifticons = filteredGifticons.filter(
        gifticon => gifticon.gifticonId !== selectedGifticon.gifticonId
      );
      setFilteredGifticons(updatedGifticons);

      // 성공 메시지 표시
      Alert.alert('사용 완료', '기프티콘이 사용완료 처리되었습니다.', [{ text: '확인' }]);
    } catch (error) {
      console.error('기프티콘 사용완료 처리 실패:', error);

      // 에러 메시지 처리
      let errorMessage = '기프티콘 사용완료 처리 중 오류가 발생했습니다.';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
      // 다이얼로그 닫기
      setDialogVisible(false);
      setSelectedGifticon(null);
    }
  };

  // 좌측 액션 (바코드 조회) 렌더링
  const renderLeftActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [0, 60],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, 40, 60],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.leftAction, { opacity }]}>
        <RectButton style={styles.actionButton} onPress={() => showUseCompleteDialog(item)}>
          <Animated.View style={[styles.actionIconContainer, { transform: [{ scale }] }]}>
            <Icon name="check-circle" type="material" color="#FFFFFF" size={24} />
            <Text style={styles.actionText}>사용 완료</Text>
          </Animated.View>
        </RectButton>
      </Animated.View>
    );
  };

  // 우측 액션 (바코드 조회) 렌더링
  const renderRightActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-60, -40, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.rightAction, { opacity }]}>
        <RectButton style={styles.actionButton} onPress={() => handleBarcodeView(item)}>
          <Animated.View style={[styles.actionIconContainer, { transform: [{ scale }] }]}>
            <Icon name="qr-code-scanner" type="material" color="#FFFFFF" size={24} />
            <Text style={styles.actionText}>바코드 조회</Text>
          </Animated.View>
        </RectButton>
      </Animated.View>
    );
  };

  // 스와이프 레퍼런스 저장
  const swipeableRefs = useRef({});

  // 렌더링할 컨텐츠
  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredGifticons.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedCategory === 'mybas' && '마이박스에 기프티콘이 없습니다.'}
            {selectedCategory === 'sharebas' && '쉐어박스에 기프티콘이 없습니다.'}
            {selectedCategory === 'used' && '사용완료된 기프티콘이 없습니다.'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.gifticonList}>
        {filteredGifticons.map(item => renderGifticonItem(item))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#278CCC" />
          </View>
        )}
      </View>
    );
  };

  // 기프티콘 아이템 렌더링
  const renderGifticonItem = item => {
    // ImageSource 부분을 FastImage로 교체
    const imageSource =
      item.thumbnailPath && typeof item.thumbnailPath === 'string'
        ? { uri: item.thumbnailPath }
        : item.thumbnailPath || require('../../assets/images/adaptive_icon.png');

    const daysLeft = item.scope === 'USED' ? null : calculateDaysLeft(item.gifticonExpiryDate);
    const isUrgent = daysLeft !== null && typeof daysLeft === 'number' && daysLeft <= 7; // 7일 이하면 긴급(빨간색)
    const isDDay = daysLeft !== null && daysLeft === 'D-day'; // D-day인 경우
    const isExpired = daysLeft !== null && daysLeft === '만료됨'; // 만료된 경우
    const isSharedByOther = item.scope === 'SHARE_BOX' && item.userId !== currentUserId;

    // 이미지 컴포넌트를 FastImage로 교체
    const renderImage = () => (
      <FastImage
        source={imageSource}
        style={styles.gifticonImage}
        resizeMode={FastImage.resizeMode.cover}
      />
    );

    // 만료된 기프티콘은 Swipeable 기능 비활성화
    if (isExpired) {
      return (
        <TouchableOpacity
          key={item.gifticonId}
          style={styles.gifticonItem}
          onPress={() => handleGifticonPress(item)}
        >
          <Shadow
            distance={12}
            startColor={'rgba(0, 0, 0, 0.008)'}
            offset={[0, 1]}
            style={styles.shadowContainer}
          >
            <View style={[styles.gifticonContent, { opacity: 0.7 }]}>
              {/* 이미지 영역 - 만료된 경우 흐리게 표시 */}
              <View style={styles.imageContainer}>{renderImage()}</View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText}>{item.brandName}</Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {item.gifticonName}
                </Text>

                {/* 쉐어박스 정보 */}
                {item.scope === 'SHARE_BOX' && item.shareBoxName && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="inventory-2"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.shareBoxText}>{item.shareBoxName}</Text>
                    {/* 다른 사람이 공유한 경우 공유자 정보 표시 */}
                    {isSharedByOther && (
                      <Text style={styles.sharedByText}> · {item.userName}님 공유</Text>
                    )}
                  </View>
                )}
              </View>

              {/* 공유 북마크 아이콘 */}
              {isSharedByOther && (
                <View style={styles.bookmarkContainer}>
                  <Icon name="bookmark" type="material" size={28} color="#278CCC" />
                </View>
              )}

              {/* 만료 태그 */}
              <View style={[styles.dDayContainer, styles.expiredDDay]}>
                <Text style={[styles.dDayText, styles.expiredDDayText]}>{daysLeft}</Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      );
    }

    // 금액형 기프티콘은 바코드 조회만 가능하게 (사용완료 스와이프 제거)
    if (item.gifticonType === 'AMOUNT') {
      return (
        <Swipeable
          key={item.gifticonId}
          ref={ref => (swipeableRefs.current[item.gifticonId] = ref)}
          renderLeftActions={null} // 좌측 스와이프(사용완료) 비활성화
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          onSwipeableOpen={direction => {
            // 다른 열린 swipeable 닫기
            Object.keys(swipeableRefs.current).forEach(key => {
              if (key !== String(item.gifticonId) && swipeableRefs.current[key]) {
                swipeableRefs.current[key].close();
              }
            });
          }}
          friction={2}
          rightThreshold={60}
          overshootRight={false}
        >
          <TouchableOpacity
            style={styles.gifticonItem}
            onPress={() => {
              // 터치 시 열려있는 swipeable 닫기
              if (swipeableRefs.current[item.gifticonId]) {
                swipeableRefs.current[item.gifticonId].close();
              }
              handleGifticonPress(item);
            }}
          >
            <Shadow
              distance={12}
              startColor={'rgba(0, 0, 0, 0.008)'}
              offset={[0, 1]}
              style={styles.shadowContainer}
            >
              <View style={styles.gifticonContent}>
                {/* 이미지 영역 */}
                <View style={styles.imageContainer}>{renderImage()}</View>

                {/* 텍스트 정보 영역 */}
                <View style={styles.textContainer}>
                  <Text style={styles.brandText}>{item.brandName}</Text>
                  <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {item.gifticonName}
                  </Text>

                  {/* 쉐어박스 정보 */}
                  {item.scope === 'SHARE_BOX' && item.shareBoxName && (
                    <View style={styles.shareBoxInfoContainer}>
                      <Icon
                        name="inventory-2"
                        type="material"
                        size={12}
                        color="#278CCC"
                        containerStyle={styles.shareBoxIcon}
                      />
                      <Text style={styles.shareBoxText}>{item.shareBoxName}</Text>
                      {/* 다른 사람이 공유한 경우 공유자 정보 표시 */}
                      {isSharedByOther && (
                        <Text style={styles.sharedByText}> · {item.userName}님 공유</Text>
                      )}
                    </View>
                  )}
                </View>

                {/* 공유 북마크 아이콘 */}
                {isSharedByOther && (
                  <View style={styles.bookmarkContainer}>
                    <Icon name="bookmark" type="material" size={28} color="#278CCC" />
                  </View>
                )}

                {/* D-day 태그 */}
                <View
                  style={[
                    styles.dDayContainer,
                    isExpired
                      ? styles.expiredDDay
                      : isUrgent || isDDay
                        ? styles.urgentDDay
                        : styles.normalDDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dDayText,
                      isExpired
                        ? styles.expiredDDayText
                        : isUrgent || isDDay
                          ? styles.urgentDDayText
                          : styles.normalDDayText,
                    ]}
                  >
                    {item.scope === 'USED'
                      ? formatDate(item.usedAt)
                      : typeof daysLeft === 'string'
                        ? daysLeft
                        : `D-${daysLeft}`}
                  </Text>
                </View>
              </View>
            </Shadow>
          </TouchableOpacity>
        </Swipeable>
      );
    }

    // 상품형 기프티콘은 양쪽 스와이프 모두 가능 (기존과 동일)
    return (
      <Swipeable
        key={item.gifticonId}
        ref={ref => (swipeableRefs.current[item.gifticonId] = ref)}
        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        onSwipeableOpen={direction => {
          // 다른 열린 swipeable 닫기
          Object.keys(swipeableRefs.current).forEach(key => {
            if (key !== String(item.gifticonId) && swipeableRefs.current[key]) {
              swipeableRefs.current[key].close();
            }
          });
        }}
        friction={2}
        leftThreshold={60}
        rightThreshold={60}
        overshootLeft={false}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.gifticonItem}
          onPress={() => {
            // 터치 시 열려있는 swipeable 닫기
            if (swipeableRefs.current[item.gifticonId]) {
              swipeableRefs.current[item.gifticonId].close();
            }
            handleGifticonPress(item);
          }}
        >
          <Shadow
            distance={12}
            startColor={'rgba(0, 0, 0, 0.008)'}
            offset={[0, 1]}
            style={styles.shadowContainer}
          >
            <View style={styles.gifticonContent}>
              {/* 이미지 영역 */}
              <View style={styles.imageContainer}>{renderImage()}</View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText}>{item.brandName}</Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {item.gifticonName}
                </Text>

                {/* 쉐어박스 정보 다시 추가 */}
                {item.scope === 'SHARE_BOX' && item.shareBoxName && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="inventory-2"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.shareBoxText}>{item.shareBoxName}</Text>
                    {/* 다른 사람이 공유한 경우 공유자 정보 표시 */}
                    {isSharedByOther && (
                      <Text style={styles.sharedByText}> · {item.userName}님 공유</Text>
                    )}
                  </View>
                )}
              </View>

              {/* 공유 북마크 아이콘 - 다른 사람이 공유한 기프티콘인 경우에만 표시 */}
              {isSharedByOther && (
                <View style={styles.bookmarkContainer}>
                  <Icon name="bookmark" type="material" size={28} color="#278CCC" />
                </View>
              )}

              {/* D-day 또는 사용일자 태그 */}
              <View
                style={[
                  styles.dDayContainer,
                  isExpired
                    ? styles.expiredDDay
                    : isUrgent || isDDay
                      ? styles.urgentDDay
                      : styles.normalDDay,
                ]}
              >
                <Text
                  style={[
                    styles.dDayText,
                    isExpired
                      ? styles.expiredDDayText
                      : isUrgent || isDDay
                        ? styles.urgentDDayText
                        : styles.normalDDayText,
                  ]}
                >
                  {item.scope === 'USED'
                    ? formatDate(item.usedAt)
                    : typeof daysLeft === 'string'
                      ? daysLeft
                      : `D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // 기프티콘 클릭 시 상세 페이지로 이동하는 함수
  const handleGifticonPress = item => {
    // 내가 공유한 기프티콘인지 확인
    const isSharer = item.scope === 'SHARE_BOX' && item.userId === currentUserId;

    // 사용 완료 기프티콘인 경우 'used-' 접두사 추가
    const gifticonId = item.scope === 'USED' ? `used-${item.gifticonId}` : item.gifticonId;

    // 기프티콘 유형에 따라 다른 상세 페이지로 이동
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('DetailProduct', {
        gifticonId: gifticonId,
        scope: item.scope, // MY_BOX, SHARE_BOX 또는 USED
        usageType: item.usageType, // USED 일 경우에만 사용됨
        usedAt: item.usedAt, // USED 일 경우에만 사용됨
        isSharer: isSharer, // 내가 공유한 기프티콘인지 여부
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('DetailAmount', {
        gifticonId: gifticonId,
        scope: item.scope, // MY_BOX, SHARE_BOX 또는 USED
        usageType: item.usageType, // USED 일 경우에만 사용됨
        usedAt: item.usedAt, // USED 일 경우에만 사용됨
        isSharer: isSharer, // 내가 공유한 기프티콘인지 여부
      });
    }
  };

  useEffect(() => {
    // 최초 로드 시 및 탭 변경 시 데이터 로드
    loadGifticons(true);

    // 화면에 다시 포커스될 때마다 데이터 새로 로드
    const unsubscribe = navigation.addListener('focus', () => {
      // 화면이 다시 포커스를 받으면 데이터 새로고침
      handleRefresh();
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCategory, selectedFilter, sortBy[selectedCategory]]);

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        {/* 카테고리 탭 */}
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* 필터링 섹션 */}
        <View style={styles.filterContainer}>
          <View style={styles.tabFilterContainer}>
            <TabFilter
              tabs={filterTabs}
              onTabChange={handleFilterChange}
              initialTabId={selectedFilter}
            />
          </View>

          {/* 정렬 드롭다운 */}
          <View style={styles.sortContainer}>
            <TouchableOpacity style={styles.sortButton} onPress={toggleSortDropdown}>
              <Text style={styles.sortButtonText}>
                {
                  (selectedCategory === 'used' ? usedSortOptions : sortOptions).find(
                    option => option.id === sortBy[selectedCategory]
                  )?.title
                }
              </Text>
              <Icon
                name={showSortDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                type="material"
                size={18}
                color="#333"
              />
            </TouchableOpacity>

            {/* 정렬 드롭다운 메뉴 */}
            {showSortDropdown && (
              <View style={styles.sortDropdown}>
                {(selectedCategory === 'used' ? usedSortOptions : sortOptions).map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.sortOption}
                    onPress={() => handleSortChange(option.id)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy[selectedCategory] === option.id && styles.sortOptionTextSelected,
                      ]}
                    >
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 기프티콘 리스트 */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#278CCC']}
            />
          }
          onScroll={({ nativeEvent }) => {
            // 스크롤이 맨 아래에 도달하면 더 불러오기
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 50; // 하단에서 50픽셀 위치에 도달하면 로드
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400} // 스크롤 이벤트 처리 주기
        >
          {renderContent()}
        </ScrollView>

        {/* 사용 완료 확인 다이얼로그 */}
        {selectedGifticon && (
          <AlertDialog
            isVisible={dialogVisible}
            title="사용 완료 처리"
            message={`${selectedGifticon.brandName} - ${selectedGifticon.gifticonName}을(를) 사용 완료 처리하시겠습니까?`}
            confirmText="확인"
            cancelText="취소"
            onConfirm={handleMarkAsUsed}
            onCancel={() => {
              setDialogVisible(false);
              setSelectedGifticon(null);
            }}
            onBackdropPress={() => {
              setDialogVisible(false);
              setSelectedGifticon(null);
            }}
            type="info"
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ManageListScreen;
