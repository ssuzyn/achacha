import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
const { width } = Dimensions.get('window');
import { calculateDday } from '../utils/dateUtils';

const GiveAwayGifticonList = ({ gifticons, onSelectGifticon }) => {
  const renderGifticonItem = ({ item }) => {
    const dday = calculateDday(item.gifticonExpiryDate);
    return (
      <TouchableOpacity style={styles.gifticonItem} onPress={() => onSelectGifticon(item)}>
        <View style={styles.contentContainer}>
          <View style={styles.gifticonDetails}>
            <Image source={{ uri: item.thumbnailPath }} style={styles.productImg} />
            <View style={styles.textContainer}>
              <Text style={styles.brandName}>{item.brandName}</Text>
              <Text style={styles.productName}>
                {item.gifticonName.length > 10
                  ? `${item.gifticonName.substring(0, 10)}...`
                  : item.gifticonName}
              </Text>
            </View>
          </View>
          <View style={styles.ddayContainer}>
            <Text style={styles.ddayText}>{dday}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>나의 기프티콘</Text>
        <Text style={styles.listSubtitle}>*임박순으로 표시 / 상품형만 가능</Text>
      </View>
      {gifticons && gifticons.length > 0 ? (
        <FlatList
          data={gifticons}
          renderItem={renderGifticonItem}
          keyExtractor={item => item.gifticonId.toString()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>보유한 기프티콘이 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(218, 240, 254, 0.8)',
    width: '90%',
    borderRadius: 10,
    maxHeight: 260,
  },
  flatListContent: {
    paddingTop: 8,
  },
  gifticonItem: {
    backgroundColor: '#F5FBFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gifticonDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImg: {
    width: 55,
    height: 55,
    marginRight: 12,
    borderRadius: 5,
  },
  textContainer: {
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    color: 'black',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: 'black',
  },
  ddayContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  ddayText: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#278CCC',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: 'white',
    backgroundColor: '#278CCC',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  listSubtitle: {
    fontSize: 12,
    fontFamily: 'Pretendard-Bold',
    color: '#278CCC',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FBFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
});

export default GiveAwayGifticonList;
