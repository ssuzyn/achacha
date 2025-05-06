// 금액형 사용내역 스크린

import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Divider } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

const DetailCashHistoryScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // 더미 기프티콘 데이터
  const gifticonData = {
    id: '1',
    brand: '스타벅스',
    name: 'APP전용 e카드 3만원 교환권',
    amount: 30000,
    totalBalance: 10000,
    usedAmount: 8000,
    remainingBalance: 2000,
    imageUrl: require('../../assets/images/starbucks-gift-card.png'),
    transactions: [
      {
        id: '1',
        date: '25.04.23',
        time: '22:12',
        amount: 3000,
        type: 'charge',
      },
      {
        id: '2',
        date: '25.04.23',
        time: '22:12',
        amount: 5000,
        type: 'payment',
      },
    ],
  };

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 뒤로가기 함수
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 수정하기 함수
  const handleEdit = transactionId => {
    console.log('수정하기:', transactionId);
  };

  // 삭제하기 함수
  const handleDelete = transactionId => {
    console.log('삭제하기:', transactionId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="chevron-left" type="material" size={28} color="#333" />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 사용내역
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* 카드 영역 */}
          <View style={styles.cardContainer}>
            {/* 기프티콘 이미지 및 정보 카드 */}
            <View style={styles.gifticonCard}>
              <Image
                source={gifticonData.imageUrl}
                style={styles.gifticonImage}
                resizeMode="contain"
              />
              <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{gifticonData.brand}</Text>
                <Text style={styles.nameText}>{gifticonData.name}</Text>
              </View>
            </View>
          </View>

          {/* 잔액 정보 */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>총 금액</Text>
              <Text style={styles.balanceValue}>{formatNumber(gifticonData.totalBalance)}원</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>사용 금액</Text>
              <Text style={styles.balanceValue}>{formatNumber(gifticonData.usedAmount)}원</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>남은 금액</Text>
              <Text style={styles.balanceValue}>
                {formatNumber(gifticonData.remainingBalance)}원
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* 거래 내역 */}
          <View style={styles.transactionsContainer}>
            {gifticonData.transactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionStore}>정주은</Text>
                  <Text style={styles.transactionDate}>
                    {transaction.date} {transaction.time}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amountText,
                      { color: transaction.type === 'charge' ? '#1E88E5' : '#F44336' },
                    ]}
                  >
                    {transaction.type === 'charge' ? '' : '-'}
                    {formatNumber(transaction.amount)}원
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(transaction.id)}
                    >
                      <Text style={styles.actionButtonText}>수정하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(transaction.id)}
                    >
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                        삭제하기
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  gifticonCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E88E5',
    overflow: 'hidden',
    alignItems: 'center',
    padding: 16,
  },
  gifticonImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  balanceSection: {
    marginTop: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  transactionsContainer: {
    marginTop: 10,
  },
  transactionItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  transactionInfo: {
    marginBottom: 10,
  },
  transactionStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  transactionAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
});

export default DetailCashHistoryScreen;
