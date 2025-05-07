// 기프티콘 조회 스크린

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
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

// 더미 데이터 - API 응답값 형식에 맞춰서 수정
const DUMMY_GIFTICONS = [
  {
    gifticonId: 122,
    gifticonName: 'APP전용 e카드 3만원 교환권',
    gifticonType: 'AMOUNT',
    gifticonExpiryDate: '2025-09-31',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'MY_BOX',
    userId: 78,
    userName: '홍길동',
    shareBoxId: null,
    shareBoxName: null,
    thumbnailPath: require('../../assets/images/dummy-starbuckscard.png'),
    gifticonCreatedAt: '2025-01-15T10:30:00',
  },
  {
    gifticonId: 123,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-12-31',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'MY_BOX',
    userId: 78,
    userName: '홍길동',
    shareBoxId: null,
    shareBoxName: null,
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2025-01-05T15:45:00',
  },
  {
    gifticonId: 124,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-11-20',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'MY_BOX',
    userId: 78,
    userName: '홍길동',
    shareBoxId: null,
    shareBoxName: null,
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2025-01-20T09:15:00',
  },
  {
    gifticonId: 125,
    gifticonName: 'APP전용 e카드 3만원 교환권',
    gifticonType: 'AMOUNT',
    gifticonExpiryDate: '2025-06-15',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 78,
    userName: '홍길동',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
    thumbnailPath: require('../../assets/images/dummy-starbuckscard.png'),
    gifticonCreatedAt: '2025-01-02T14:20:00',
  },
  {
    gifticonId: 126,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-05-10',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 79,
    userName: '김철수',
    shareBoxId: 91,
    shareBoxName: '가족 모임',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2025-01-10T11:30:00',
  },
  {
    gifticonId: 127,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-04-23',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'USED',
    usageType: 'SELF_USE', // 사용하기
    usedAt: '2025-01-15T14:30:00',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2024-12-20T13:10:00',
  },
  {
    gifticonId: 128,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-02-15',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'USED',
    usageType: 'PRESENT', // 선물하기
    usedAt: '2025-01-20T10:15:00',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2024-12-15T16:40:00',
  },
  {
    gifticonId: 130,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-02-20',
    brandId: 47,
    brandName: '스타벅스',
    scope: 'USED',
    usageType: 'GIVE_AWAY', // 나눔하기
    usedAt: '2025-01-22T11:30:00',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2024-12-10T09:25:00',
  },
  {
    gifticonId: 129,
    gifticonName: 'APP전용 e카드 3만원 교환권',
    gifticonType: 'AMOUNT',
    gifticonExpiryDate: '2025-03-31',
    brandId: 46,
    brandName: '스타벅스',
    scope: 'USED',
    usageType: 'SELF_USE',
    usedAt: '2025-01-25T16:45:00',
    thumbnailPath: require('../../assets/images/dummy-starbuckscard.png'),
    gifticonCreatedAt: '2024-12-05T10:50:00',
  },
  {
    gifticonId: 131,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-07-20',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 80,
    userName: '이영희',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2025-01-05T13:25:00',
  },
];

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
  const [sortBy, setSortBy] = useState('recent');
  // 정렬 드롭다운 표시 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // 필터링된 기프티콘 상태
  const [filteredGifticons, setFilteredGifticons] = useState([]);

  // 카테고리 탭 데이터
  const categories = [
    { id: 'mybas', name: '마이박스' },
    { id: 'sharebas', name: '쉐어박스' },
    { id: 'used', name: '사용완료' },
  ];

  // 필터 탭 데이터
  const filterTabs = [
    { id: 'all', title: '전체' },
    { id: 'product', title: '상품형' },
    { id: 'amount', title: '금액형' },
  ];

  // 정렬 옵션
  const sortOptions = [
    { id: 'recent', title: '등록순' },
    { id: 'expiry', title: '임박순' },
  ];

  // 사용완료 탭 정렬 옵션
  const usedSortOptions = [{ id: 'recent', title: '최근 사용 순' }];

  // 현재 로그인한 사용자의 ID (실제 구현에서는 context나 state에서 가져옴)
  const currentUserId = 78;

  // 파라미터에서 initialTab이 변경되면 selectedCategory 업데이트
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedCategory(route.params.initialTab);
      // 사용완료 탭으로 변경 시 정렬 옵션도 변경
      if (route.params.initialTab === 'used') {
        setSortBy('recent');
      }
    }
  }, [route.params?.initialTab]);

  // 카테고리 변경 시 정렬 옵션 초기화
  useEffect(() => {
    if (selectedCategory === 'used') {
      setSortBy('recent');
    }
  }, [selectedCategory]);

  // 카테고리에 따른 기프티콘 필터링
  useEffect(() => {
    filterGifticons();
  }, [selectedCategory, selectedFilter, sortBy]);

  // 선택된 카테고리에 따라 기프티콘 필터링
  const filterGifticons = () => {
    let filtered = [...DUMMY_GIFTICONS];

    // 카테고리 필터링
    switch (selectedCategory) {
      case 'mybas':
        filtered = filtered.filter(item => item.scope === 'MY_BOX');
        break;
      case 'sharebas':
        filtered = filtered.filter(item => item.scope === 'SHARE_BOX');
        break;
      case 'used':
        filtered = filtered.filter(item => item.scope === 'USED');
        break;
      default:
        break;
    }

    // 필터 적용
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'product') {
        filtered = filtered.filter(item => item.gifticonType === 'PRODUCT');
      } else if (selectedFilter === 'amount') {
        filtered = filtered.filter(item => item.gifticonType === 'AMOUNT');
      }
    }

    // 정렬 적용
    if (sortBy === 'recent') {
      if (selectedCategory === 'used') {
        // 사용완료 탭에서는 사용일시 기준 최신순
        filtered.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
      } else {
        // 등록일시 기준 최신순
        filtered.sort((a, b) => new Date(b.gifticonCreatedAt) - new Date(a.gifticonCreatedAt));
      }
    } else if (sortBy === 'expiry') {
      // D-day 기준 임박순
      filtered.sort((a, b) => {
        const aDaysLeft = calculateDaysLeft(a.gifticonExpiryDate);
        const bDaysLeft = calculateDaysLeft(b.gifticonExpiryDate);
        return aDaysLeft - bDaysLeft;
      });
    }

    setFilteredGifticons(filtered);
  };

  // 카테고리 변경 처리
  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId);
  };

  // 필터 변경 처리
  const handleFilterChange = filterId => {
    setSelectedFilter(filterId);
  };

  // 정렬 변경 처리
  const handleSortChange = sortId => {
    setSortBy(sortId);
    setShowSortDropdown(false);
  };

  // 정렬 드롭다운 토글
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // 날짜 차이 계산 함수
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
  const handleMarkAsUsed = () => {
    if (!selectedGifticon) return;

    // 여기서 API 호출로 상태 변경 (예시)
    console.log(`기프티콘 ID ${selectedGifticon.gifticonId} 사용 완료 처리됨`);

    // 상태 업데이트 및 화면 갱신 (임시 구현)
    const updatedGifticons = filteredGifticons.filter(
      gifticon => gifticon.gifticonId !== selectedGifticon.gifticonId
    );
    setFilteredGifticons(updatedGifticons);

    // 다이얼로그 닫기
    setDialogVisible(false);
    setSelectedGifticon(null);
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

  // 기프티콘 아이템 렌더링
  const renderGifticonItem = item => {
    const daysLeft = item.scope === 'USED' ? null : calculateDaysLeft(item.gifticonExpiryDate);
    const isUrgent = daysLeft !== null && daysLeft <= 7; // 7일 이하면 긴급(빨간색)
    const isSharedByOther = item.scope === 'SHARE_BOX' && item.userId !== currentUserId;

    // 사용 완료된 기프티콘은 스와이프 불가능
    if (item.scope === 'USED') {
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
            <View style={styles.gifticonContent}>
              {/* 이미지 영역 */}
              <View style={styles.imageContainer}>
                <Image source={item.thumbnailPath} style={styles.gifticonImage} />
              </View>

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
                      color="#888"
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
                style={[styles.dDayContainer, isUrgent ? styles.urgentDDay : styles.normalDDay]}
              >
                <Text
                  style={[
                    styles.dDayText,
                    isUrgent ? styles.urgentDDayText : styles.normalDDayText,
                  ]}
                >
                  {item.scope === 'USED' ? formatDate(item.usedAt) : `D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      );
    }

    // 마이박스와 쉐어박스 기프티콘은 스와이프 가능
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
              <View style={styles.imageContainer}>
                <Image source={item.thumbnailPath} style={styles.gifticonImage} />
              </View>

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
                      color="#888"
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
                style={[styles.dDayContainer, isUrgent ? styles.urgentDDay : styles.normalDDay]}
              >
                <Text
                  style={[
                    styles.dDayText,
                    isUrgent ? styles.urgentDDayText : styles.normalDDayText,
                  ]}
                >
                  {item.scope === 'USED' ? formatDate(item.usedAt) : `D-${daysLeft}`}
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
    // 기프티콘 유형에 따라 다른 상세 페이지로 이동
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('DetailProduct', {
        gifticonId: item.gifticonId,
        scope: item.scope, // MY_BOX, SHARE_BOX 또는 USED
        usageType: item.usageType, // USED 일 경우에만 사용됨
        usedAt: item.usedAt, // USED 일 경우에만 사용됨
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('DetailAmount', {
        gifticonId: item.gifticonId,
        scope: item.scope, // MY_BOX, SHARE_BOX 또는 USED
        usageType: item.usageType, // USED 일 경우에만 사용됨
        usedAt: item.usedAt, // USED 일 경우에만 사용됨
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 헤더 */}
      <View style={styles.headerSection}>
        <Text variant="h2" weight="bold" style={styles.headerTitle}>
          기프티콘 관리
        </Text>
      </View>

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
                  option => option.id === sortBy
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
                      sortBy === option.id && styles.sortOptionTextSelected,
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
      >
        <View style={styles.gifticonList}>
          {filteredGifticons.length > 0 ? (
            filteredGifticons.map(item => renderGifticonItem(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedCategory === 'mybas' && '마이박스에 기프티콘이 없습니다.'}
                {selectedCategory === 'sharebas' && '쉐어박스에 기프티콘이 없습니다.'}
                {selectedCategory === 'used' && '사용완료된 기프티콘이 없습니다.'}
              </Text>
            </View>
          )}
        </View>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
  },
  headerSection: {
    paddingTop: 0,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
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
  },
  sortOptionTextSelected: {
    color: '#3498DB',
    fontWeight: 'bold',
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
    paddingVertical: 5,
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
    padding: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    position: 'relative', // D-day 태그의 절대 위치를 위해 필요
  },
  imageContainer: {
    marginRight: 16,
  },
  gifticonImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    paddingRight: 80, // D-day 태그를 위한 여백 확보
  },
  dDayContainer: {
    position: 'absolute',
    top: '50%',
    right: 16,
    paddingHorizontal: 10,
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
    fontSize: 12,
    fontWeight: 'bold',
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
    color: '#888',
  },
  sharedByText: {
    fontSize: 12,
    color: '#278CCC',
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
  shareBoxInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  shareBoxIcon: {
    marginRight: 3,
  },
  shareBoxText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
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
    width: 100, // 1/3 정도 보이도록 너비 조정
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
  },
  // 북마크 컨테이너 스타일 추가
  bookmarkContainer: {
    position: 'absolute',
    top: -2,
    left: 12,
    zIndex: 10,
  },
});

export default ManageListScreen;
