// 기프티콘 조회 스크린

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components/ui';
import CategoryTabs from '../../components/common/CategoryTabs';
import TabFilter from '../../components/common/TabFilter';
import { useTheme } from '../../hooks/useTheme';

// 더미 데이터
const DUMMY_GIFTICONS = [
  {
    id: '1',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    expiryDate: '2023-12-31',
    imageUrl: require('../../assets/images/dummy-starbucks.png'),
    daysLeft: 7,
  },
  {
    id: '2',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    expiryDate: '2023-12-25',
    imageUrl: require('../../assets/images/dummy-starbucks.png'),
    daysLeft: 7,
  },
  {
    id: '3',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    expiryDate: '2024-01-05',
    imageUrl: require('../../assets/images/dummy-starbucks.png'),
    daysLeft: 7,
  },
  {
    id: '4',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    expiryDate: '2024-01-10',
    imageUrl: require('../../assets/images/dummy-starbucks.png'),
    daysLeft: 7,
  },
];

const ListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 카테고리 상태
  const [selectedCategory, setSelectedCategory] = useState('mybas');
  // 필터 상태
  const [selectedFilter, setSelectedFilter] = useState('all');
  // 정렬 상태
  const [sortBy, setSortBy] = useState('recent');
  // 정렬 드롭다운 표시 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // 카테고리 탭 데이터
  const categories = [
    { id: 'mybas', name: '마이바스' },
    { id: 'sharebas', name: '쉐어바스' },
    { id: 'used', name: '사용완료' },
  ];

  // 필터 탭 데이터
  const filterTabs = [
    { id: 'all', title: '전체' },
    { id: 'coupon', title: '상품권' },
    { id: 'price', title: '금액형' },
  ];

  // 정렬 옵션
  const sortOptions = [
    { id: 'recent', title: '최근 등록순' },
    { id: 'expiry', title: '유효기간 임박순' },
    { id: 'brand', title: '브랜드명순' },
  ];

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

  // 기프티콘 아이템 렌더링
  const renderGifticonItem = item => (
    <TouchableOpacity
      key={item.id}
      style={styles.gifticonItem}
      onPress={() => navigation.navigate('GifticonDetail', { id: item.id })}
    >
      <View style={styles.gifticonContent}>
        <Image source={item.imageUrl} style={styles.gifticonImage} />
        <View style={styles.gifticonInfo}>
          <Text style={styles.brandText}>{item.brand}</Text>
          <Text style={styles.nameText}>{item.name}</Text>
        </View>
        <View style={styles.expiryContainer}>
          <Text style={styles.expiryText}>D-{item.daysLeft}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 관리
        </Text>
      </View>

      {/* 카테고리 탭 */}
      <View style={styles.categoryTabContainer}>
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />
      </View>

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
              size={24}
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
          {DUMMY_GIFTICONS.map(item => renderGifticonItem(item))}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    textAlign: 'center',
  },
  categoryTabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
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
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortButtonText: {
    fontSize: 14,
    marginRight: 5,
  },
  sortDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sortOptionText: {
    fontSize: 14,
  },
  sortOptionTextSelected: {
    color: '#5DADE2',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  gifticonList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  gifticonItem: {
    backgroundColor: '#E6F4FB',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  gifticonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  gifticonImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
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
  expiryContainer: {
    marginLeft: 'auto',
  },
  expiryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5DADE2',
  },
});

export default ListScreen;
