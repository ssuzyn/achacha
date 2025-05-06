// 기프티콘 조회 스크린

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components/ui';
import CategoryTabs from '../../components/common/CategoryTabs';
import TabFilter from '../../components/common/TabFilter';
import { useTheme } from '../../hooks/useTheme';
import { Shadow } from 'react-native-shadow-2';

// 더미 데이터 - API 응답값 형식에 맞춰서 수정
const DUMMY_GIFTICONS = [
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
  },
  {
    gifticonId: 126,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-05-10',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 78,
    userName: '홍길동',
    shareBoxId: 91,
    shareBoxName: '가족 모임',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
  },
  {
    gifticonId: 127,
    gifticonName: '아메리카노',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-04-23',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'USED',
    usageType: 'SELF_USE', // 사용하기
    usedAt: '2025-01-15T14:30:00',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
  },
  {
    gifticonId: 128,
    gifticonName: '카페라떼',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-02-15',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'USED',
    usageType: 'PRESENT', // 선물하기
    usedAt: '2025-01-20T10:15:00',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
  },
  {
    gifticonId: 130,
    gifticonName: '빙수',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-02-20',
    brandId: 47,
    brandName: '설빙',
    scope: 'USED',
    usageType: 'GIVE_AWAY', // 나눔하기
    usedAt: '2025-01-22T11:30:00',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
  },
  {
    gifticonId: 129,
    gifticonName: '문화상품권',
    gifticonType: 'AMOUNT',
    gifticonExpiryDate: '2025-03-31',
    brandId: 46,
    brandName: '컬쳐랜드',
    scope: 'USED',
    usageType: 'SELF_USE',
    usedAt: '2025-01-25T16:45:00',
    thumbnailPath: require('../../assets/images/dummy-starbuckscard.png'),
  },
];

const ManageListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

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

  // 파라미터에서 initialTab이 변경되면 selectedCategory 업데이트
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedCategory(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

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
      // ID 기준 최신순 (임시로 ID가 높을수록 최신이라고 가정)
      filtered.sort((a, b) => b.gifticonId - a.gifticonId);
    } else if (sortBy === 'expiry') {
      // 유효기간 임박순
      filtered.sort((a, b) => new Date(a.gifticonExpiryDate) - new Date(b.gifticonExpiryDate));
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

  // 기프티콘 아이템 렌더링
  const renderGifticonItem = item => (
    <TouchableOpacity
      key={item.gifticonId}
      style={styles.gifticonItem}
      onPress={() => handleGifticonPress(item)}
    >
      <Shadow
        distance={6}
        startColor={'rgba(0, 0, 0, 0.03)'}
        offset={[0, 1]}
        style={styles.shadowContainer}
      >
        <View
          style={[
            styles.gifticonContent,
            item.scope === 'USED' ? styles.usedGifticonContent : null,
          ]}
        >
          <Image source={item.thumbnailPath} style={styles.gifticonImage} />
          <View style={styles.gifticonInfo}>
            <Text style={styles.brandText}>{item.brandName}</Text>
            <Text style={styles.nameText}>{item.gifticonName}</Text>
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
              </View>
            )}
          </View>
          <View style={styles.expiryContainer}>
            {item.scope === 'USED' ? (
              <Text style={styles.dateText}>{formatDate(item.gifticonExpiryDate)}</Text>
            ) : (
              <Text style={styles.expiryText}>D-{calculateDaysLeft(item.gifticonExpiryDate)}</Text>
            )}
          </View>
        </View>
      </Shadow>
    </TouchableOpacity>
  );

  // 기프티콘 클릭 시 상세 페이지로 이동하는 함수
  const handleGifticonPress = item => {
    // 사용완료된 기프티콘은 상세화면으로 이동하지 않음
    if (item.scope === 'USED') {
      // 옵션: 사용완료된 기프티콘에 대한 토스트 메시지 표시 가능
      console.log('사용완료된 기프티콘입니다.');
      return;
    }

    // 기프티콘 유형에 따라 다른 상세 페이지로 이동
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('DetailProduct', {
        gifticonId: item.gifticonId,
        scope: item.scope, // MY_BOX 또는 SHARE_BOX
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('DetailAmount', {
        gifticonId: item.gifticonId,
        scope: item.scope, // MY_BOX 또는 SHARE_BOX
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

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
              {sortOptions.find(option => option.id === sortBy)?.title}
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
              {sortOptions.map(option => (
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 5,
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
    paddingVertical: 8,
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
    paddingHorizontal: 12,
  },
  gifticonList: {
    paddingVertical: 5,
  },
  shadowContainer: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
  },
  gifticonItem: {
    width: '100%',
  },
  gifticonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E6F4FB',
    borderRadius: 10,
  },
  usedGifticonContent: {
    backgroundColor: '#E8F4F0',
  },
  gifticonImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  gifticonInfo: {
    flex: 1,
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    fontStyle: 'italic',
  },
  expiryContainer: {
    marginLeft: 'auto',
  },
  expiryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#555',
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
});

export default ManageListScreen;
