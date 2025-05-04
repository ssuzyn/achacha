import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MapGifticonItem from './MapGifticonItem';

const MapGifticonList = ({ gifticons, onUseGifticon }) => {
  // 보유하고 있는 기프티콘이 없을 때
  if (!gifticons || gifticons.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>사용 가능한 기프티콘이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>사용 가능한 기프티콘</Text>
      <BottomSheetFlatList
        data={gifticons}
        renderItem={({ item }) => <MapGifticonItem gifticon={item} onUse={onUseGifticon} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    marginHorizontal: 20,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});

export default MapGifticonList;
