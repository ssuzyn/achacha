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
import { useTheme } from '../hooks/useTheme'; // 커스텀 useTheme 훅 가져오기

const StarbucksImg = require('../assets/images/starbucks.png');

const GiveAwayGifticonList = ({ gifticons, onSelectGifticon }) => {
  // useTheme 훅을 사용하여 테마 색상에 접근
  const { colors, getFontFamily } = useTheme();

  const renderGifticonItem = ({ item }) => {
    const dday = calculateDday(item.gifticonExpiryDate);
    return (
      <TouchableOpacity style={styles.gifticonItem} onPress={() => onSelectGifticon(item)}>
        <View style={styles.contentContainer}>
          <View style={styles.gifticonDetails}>
            <Image source={StarbucksImg} style={styles.productImg} />
            <View style={styles.textContainer}>
              <Text style={[styles.brandName, { fontFamily: getFontFamily('bold') }]}>
                {item.brandName}
              </Text>
              <Text style={[styles.productName, { fontFamily: getFontFamily('regular') }]}>
                {item.gifticonName}
              </Text>
            </View>
          </View>
          <View style={styles.ddayContainer}>
            <Text
              style={[
                styles.ddayText,
                { color: colors.secondary, fontFamily: getFontFamily('bold') },
              ]}
            >
              {dday}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text
          style={[
            styles.listTitle,
            {
              backgroundColor: colors.secondary,
              fontFamily: getFontFamily('bold'),
            },
          ]}
        >
          나의 기프티콘
        </Text>
        <Text
          style={[
            styles.listSubtitle,
            {
              color: colors.secondary,
              fontFamily: getFontFamily('bold'),
            },
          ]}
        >
          *임박순으로 표시 / 상품형만 가능
        </Text>
      </View>
      {gifticons && gifticons.length > 0 ? (
        <FlatList
          data={gifticons}
          renderItem={renderGifticonItem}
          keyExtractor={item => item.gifticonId.toString()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { fontFamily: getFontFamily('medium') }]}>
            보유한 기프티콘이 없습니다.
          </Text>
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
    color: 'black',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: 'black',
  },
  ddayContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  ddayText: {
    fontSize: 20,
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
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  listSubtitle: {
    fontSize: 12,
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
    color: '#555',
    textAlign: 'center',
  },
});

export default GiveAwayGifticonList;
