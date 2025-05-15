import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const GiveAwayGifticonList = ({ gifticons, onSelectGifticon, isLoading }) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!gifticons || gifticons.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>사용 가능한 기프티콘이 없습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.gifticonItem} onPress={() => onSelectGifticon(item)}>
      <Image
        source={{ uri: item.thumbnailPath }}
        style={styles.gifticonImage}
        onError={error => {
          console.log('기프티콘 이미지 로드 실패:', error);
        }}
      />
      <View style={styles.gifticonInfo}>
        <Text style={styles.gifticonName} numberOfLines={1}>
          {item.gifticonName}
        </Text>
        <Text style={styles.expiryDate}>
          유효기간: {new Date(item.gifticonExpiryDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={gifticons}
        renderItem={renderItem}
        keyExtractor={item => item.gifticonId.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%',
    height: '100%',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
  },
  gifticonItem: {
    width: 150,
    marginHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
  },
  gifticonImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  gifticonInfo: {
    flex: 1,
  },
  gifticonName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default GiveAwayGifticonList;
