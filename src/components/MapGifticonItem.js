import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateDday } from '../utils/dateUtils';

const MapGifticonItem = ({ gifticon, onUse }) => {
  // 브랜드명, 만료 날짜, 메뉴명, 이미지
  const { brand, expiryDate, menuName, imageUrl, id } = gifticon;

  const dday = calculateDday(expiryDate);

  return (
    <View style={styles.container}>
      <Image source={imageUrl} style={styles.image} />
      {/* 기프티콘 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.brand}>{brand}</Text>
          <Text style={styles.dday}>{dday}</Text>
        </View>
        <Text style={styles.menuName}>{menuName}</Text>
      </View>

      {/* 사용 버튼 */}
      <TouchableOpacity style={styles.useButton} onPress={() => onUse(id)}>
        <Text style={styles.buttonText}>사용</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuName: {
    fontSize: 12,
    color: '#666',
  },
  dday: {
    fontSize: 14,
    color: '#278CCC',
    fontWeight: '500',
  },
  useButton: {
    backgroundColor: '#56AEE9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MapGifticonItem;
