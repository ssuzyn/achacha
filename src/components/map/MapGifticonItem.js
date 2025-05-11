import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateDday } from '../../utils/dateUtils';

const MapGifticonItem = ({ gifticon, onUse, onSelectBrand, isSelected }) => {
  const { brandName, gifticonExpiryDate, gifticonName, thumbnailPath, gifticonId, brandId } =
    gifticon;

  const dday = calculateDday(gifticonExpiryDate);

  // 아이템 클릭 핸들러
  const handleItemPress = () => {
    onSelectBrand(brandId);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={handleItemPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: `https://example.com${thumbnailPath}` }} style={styles.image} />
      {/* 기프티콘 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.brand}>{brandName}</Text>
          <Text style={styles.dday}>{dday}</Text>
        </View>
        <Text style={styles.menuName}>{gifticonName}</Text>
      </View>

      {/* 사용 버튼 */}
      <TouchableOpacity
        style={styles.useButton}
        onPress={e => {
          e.stopPropagation(); // 부모 터치 이벤트 전파 중단
          onUse(gifticonId);
        }}
      >
        <Text style={styles.buttonText}>사용</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FBFF',
    borderRadius: 8,
    marginBottom: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#56AEE9',
    backgroundColor: '#EBF7FF',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  brand: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  menuName: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  dday: {
    fontSize: 15,
    color: '#278CCC',
    fontFamily: 'Pretendard-SemiBold',
  },
  useButton: {
    backgroundColor: '#56AEE9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default MapGifticonItem;
