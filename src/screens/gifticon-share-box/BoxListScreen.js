// 쉐어박스 목록 스크린
// 사용완료 리스트에서 사용자 사용일자 보이게 처리해야 함

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 더미 데이터 - API 응답값 형식에 맞춰서 수정
const DUMMY_GIFTICONS = [
  {
    gifticonId: 122,
    gifticonName: 'APP전용 e카드 3만원 교환권',
    gifticonType: 'AMOUNT',
    gifticonExpiryDate: '2025-09-31',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 78, // 사용자가 공유한 기프티콘
    userName: '홍길동',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
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
    scope: 'SHARE_BOX',
    userId: 78, // 사용자가 공유한 기프티콘
    userName: '홍길동',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
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
    scope: 'SHARE_BOX',
    userId: 90, // 다른 사용자가 공유한 기프티콘
    userName: '김영희',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2025-01-20T09:15:00',
  },
  {
    gifticonId: 125,
    gifticonName: '아이스 카페 아메리카노 T',
    gifticonType: 'PRODUCT',
    gifticonExpiryDate: '2025-10-15',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 91, // 다른 사용자가 공유한 기프티콘
    userName: '이철수',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2025-02-01T08:20:00',
  },
  {
    gifticonId: 126,
    gifticonName: 'APP전용 e카드 3만원 교환권',
    gifticonType: 'AMOUNT',
    gifticonExpiryDate: '2025-05-16',
    brandId: 45,
    brandName: '스타벅스',
    scope: 'SHARE_BOX',
    userId: 92, // 다른 사용자가 공유한 기프티콘
    userName: '박지민',
    shareBoxId: 90,
    shareBoxName: '스터디 그룹',
    thumbnailPath: require('../../assets/images/dummy-starbuckscard.png'),
    gifticonCreatedAt: '2025-01-10T14:40:00',
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
    usedBy: '김철수', // 사용한 사용자 이름
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
    usageType: 'SELF_USE', // 사용하기
    usedAt: '2025-01-20T10:15:00',
    usedBy: '이영희', // 사용한 사용자 이름
    thumbnailPath: require('../../assets/images/dummy-starbucks.png'),
    gifticonCreatedAt: '2024-12-15T16:40:00',
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
    usedBy: '박지민', // 사용한 사용자 이름
    thumbnailPath: require('../../assets/images/dummy-starbuckscard.png'),
    gifticonCreatedAt: '2024-12-05T10:50:00',
  },
];

const BoxListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // 쉐어박스 ID와 이름 가져오기
  const shareBoxId = route.params?.shareBoxId || 0;
  const shareBoxName = route.params?.shareBoxName;

  // route.params에서 initialTab을 가져와 초기 탭 설정
  const initialTab = route.params?.initialTab || 'available';

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

  // AlertDialog 상태 관리
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);

  // 스와이프 레퍼런스 저장
  const swipeableRefs = useRef({});

  // 카테고리 탭 데이터 - 사용가능, 사용완료만 표시
  const categories = [
    { id: 'available', name: '사용가능' },
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

  // 파라미터에서 initialTab이 변경되면 selectedCategory 업데이트
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedCategory(route.params.initialTab);
      // 사용완료 탭으로 변경 시 정렬 옵션도 변경
      if (route.params.initialTab === 'used') {
        setSortBy('recent');
      }
      // 카테고리 변경 시 필터를 항상 '전체'로 초기화
      setSelectedFilter('all');
    }

    // shareBoxId로 데이터 불러오기 (실제 구현 시)
  }, [route.params?.initialTab, shareBoxId, currentUserId]);

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
      case 'available':
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

  // 정렬 드롭다운 토글
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // 정렬 선택 핸들러
  const handleSelectSort = sortOption => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  // 카테고리 선택 핸들러
  const handleSelectCategory = categoryId => {
    setSelectedCategory(categoryId);

    // 사용완료 탭에서는 사용순으로만 정렬
    if (categoryId === 'used') {
      setSortBy('recent');
    }

    // 필터는 항상 '전체'로 초기화
    setSelectedFilter('all');
  };

  // 필터 선택 핸들러
  const handleSelectFilter = filterId => {
    setSelectedFilter(filterId);
  };

  // 설정 화면으로 이동하는 핸들러 추가
  const handleSettingsPress = () => {
    navigation.navigate('BoxSetting', {
      shareBoxId,
      shareBoxName,
    });
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 날짜 포맷 함수 - YY.MM.DD 형식
  const formatDate = dateString => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(2); // 4자리 년도에서 뒤의 2자리만 사용
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 만료일까지 남은 일수 계산
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0; // 음수일 경우 0으로 표시
  };

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

    // 상태 업데이트 및 화면 갱신 (임시 구현)
    const updatedGifticons = filteredGifticons.filter(
      gifticon => gifticon.gifticonId !== selectedGifticon.gifticonId
    );
    setFilteredGifticons(updatedGifticons);

    // 다이얼로그 닫기
    setDialogVisible(false);
    setSelectedGifticon(null);
  };

  // 기프티콘 클릭 핸들러
  const handleGifticonPress = item => {
    // 기프티콘 타입에 따라 다른 상세 화면으로 이동
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('BoxDetailProduct', {
        gifticonId: item.gifticonId,
        scope: item.scope === 'USED' ? 'USED' : 'SHARE_BOX',
        usageType: item.usageType,
        usedAt: item.usedAt,
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('BoxDetailAmount', {
        gifticonId: item.gifticonId,
        scope: item.scope === 'USED' ? 'USED' : 'SHARE_BOX',
        usageType: item.usageType,
        usedAt: item.usedAt,
      });
    }
  };

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

                {/* 쉐어박스 정보 */}
                {item.scope === 'SHARE_BOX' && item.userName && item.userId !== currentUserId && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText}>{item.userName}님 공유</Text>
                  </View>
                )}

                {/* 사용완료 기프티콘에 사용자 정보 표시 */}
                {item.scope === 'USED' && item.usedBy && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText}>{item.usedBy}님 사용</Text>
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
                <View style={styles.imageContainer}>
                  <Image source={item.thumbnailPath} style={styles.gifticonImage} />
                </View>

                {/* 텍스트 정보 영역 */}
                <View style={styles.textContainer}>
                  <Text style={styles.brandText}>{item.brandName}</Text>
                  <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {item.gifticonName}
                  </Text>

                  {/* 쉐어박스 정보 */}
                  {item.scope === 'SHARE_BOX' && item.userName && item.userId !== currentUserId && (
                    <View style={styles.shareBoxInfoContainer}>
                      <Icon
                        name="person"
                        type="material"
                        size={12}
                        color="#278CCC"
                        containerStyle={styles.shareBoxIcon}
                      />
                      <Text style={styles.sharedByText}>{item.userName}님 공유</Text>
                    </View>
                  )}

                  {/* 사용완료 기프티콘에 사용자 정보 표시 */}
                  {item.scope === 'USED' && item.usedBy && (
                    <View style={styles.shareBoxInfoContainer}>
                      <Icon
                        name="person"
                        type="material"
                        size={12}
                        color="#278CCC"
                        containerStyle={styles.shareBoxIcon}
                      />
                      <Text style={styles.sharedByText}>{item.usedBy}님 사용</Text>
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
                  style={[styles.dDayContainer, isUrgent ? styles.urgentDDay : styles.normalDDay]}
                >
                  <Text
                    style={[
                      styles.dDayText,
                      isUrgent ? styles.urgentDDayText : styles.normalDDayText,
                    ]}
                  >
                    {`D-${daysLeft}`}
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
              <View style={styles.imageContainer}>
                <Image source={item.thumbnailPath} style={styles.gifticonImage} />
              </View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText}>{item.brandName}</Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {item.gifticonName}
                </Text>

                {/* 쉐어박스 정보 */}
                {item.scope === 'SHARE_BOX' && item.userName && item.userId !== currentUserId && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText}>{item.userName}님 공유</Text>
                  </View>
                )}

                {/* 사용완료 기프티콘에 사용자 정보 표시 */}
                {item.scope === 'USED' && item.usedBy && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText}>{item.usedBy}님 사용</Text>
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
                  {`D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // 좌측 액션 (상세보기) 렌더링
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="chevron-left" type="material" size={30} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.title}>
          {shareBoxName || '쉐어박스'}
        </Text>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Icon name="settings" type="material" size={24} color={theme.colors.grey3} />
        </TouchableOpacity>
      </View>

      {/* 카테고리 탭 */}
      <View style={styles.categoryTabContainer}>
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </View>

      {/* 필터 및 정렬 영역 */}
      <View style={styles.filterSortContainer}>
        {/* 필터 탭 */}
        <View style={styles.filterContainer}>
          <TabFilter
            tabs={filterTabs}
            selectedId={selectedFilter}
            onSelectTab={handleSelectFilter}
          />
        </View>

        {/* 정렬 드롭다운 */}
        <View style={styles.sortContainer}>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSortDropdown}>
            <Text style={styles.sortButtonText}>
              {(selectedCategory === 'used' ? usedSortOptions : sortOptions).find(
                option => option.id === sortBy
              )?.title || '정렬'}
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
                  onPress={() => handleSelectSort(option.id)}
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

      {/* 기프티콘 목록 */}
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
              <Icon name="inbox" type="material" size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>
                {selectedCategory === 'available'
                  ? '사용가능한 기프티콘이 없습니다'
                  : '사용완료한 기프티콘이 없습니다'}
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
    paddingHorizontal: 2,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabContainer: {
    paddingHorizontal: 16,
    marginTop: 1,
    marginBottom: 1,
  },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  filterContainer: {
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
    color: '#56AEE9',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginTop: 5,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  gifticonList: {
    paddingVertical: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#737373',
  },
  gifticonItem: {
    width: '100%',
  },
  shadowContainer: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  imageContainer: {
    marginRight: 10,
  },
  gifticonImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  gifticonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 0,
    paddingRight: 80, // D-day 태그를 위한 여백 확보
  },
  shareBoxInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  shareBoxIcon: {
    marginRight: 3,
  },
  sharedByText: {
    fontSize: 12,
    color: '#278CCC',
    fontWeight: 'bold',
    fontStyle: 'normal',
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
  },
  urgentDDayText: {
    color: '#EA5455',
  },
  normalDDayText: {
    color: '#72BFFF',
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
  },
  bookmarkContainer: {
    position: 'absolute',
    top: -2,
    left: 12,
    zIndex: 10,
  },
});

export default BoxListScreen;
