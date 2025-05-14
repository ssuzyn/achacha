// 쉐어박스 금액형 사용내역 스크린

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Divider } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useTabBar } from '../../context/TabBarContext';
import NavigationService from '../../navigation/NavigationService';
import { useRoute } from '@react-navigation/native';

const BoxDetailAmountHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showTabBar } = useTabBar();
  const route = useRoute();
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [scope, setScope] = useState('SHARE_BOX'); // 기본값을 SHARE_BOX로 변경
  const [usageType, setUsageType] = useState(null);

  // 바텀탭 표시
  useEffect(() => {
    showTabBar();

    // 라우트 파라미터에서 scope와 usageType 정보 가져오기
    if (route.params) {
      if (route.params.scope) {
        setScope(route.params.scope);
      }
      if (route.params.usageType) {
        setUsageType(route.params.usageType);
      }
    }

    // 더미 기프티콘 데이터 초기화
    const transactionsData = [
      {
        id: '1',
        userName: '홍길동',
        date: '2025.01.10 14:30',
        amount: 3000,
        type: 'payment',
        timestamp: new Date('2025-01-10T14:30:00').getTime(),
      },
      {
        id: '2',
        userName: '김철수',
        date: '2025.01.20 16:45',
        amount: 5000,
        type: 'payment',
        timestamp: new Date('2025-01-20T16:45:00').getTime(),
      },
      {
        id: '3',
        userName: '박지민',
        date: '2025.01.25 10:15',
        amount: 20000,
        type: 'payment',
        timestamp: new Date('2025-01-25T10:15:00').getTime(),
      },
    ];

    // 일자별 내림차순(최신순)으로 정렬
    const sortedTransactions = [...transactionsData].sort((a, b) => b.timestamp - a.timestamp);

    setTransactions(sortedTransactions);
  }, []);

  // 더미 기프티콘 데이터
  const gifticonData = {
    id: '1',
    brand: '스타벅스',
    name: 'APP전용 e카드 3만원 교환권',
    amount: 30000,
    totalBalance: 30000,
    usedAmount: 28000,
    remainingBalance: 2000,
  };

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 뒤로가기 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 수정하기 함수
  const handleEdit = transactionId => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setEditingId(transactionId);
      setEditValue(transaction.amount.toString());
    }
  };

  // 수정 취소 함수
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // 수정 저장 함수
  const handleSaveEdit = transactionId => {
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('유효하지 않은 금액', '올바른 금액을 입력하세요.');
      return;
    }

    setTransactions(prev => {
      const updatedTransactions = prev.map(item =>
        item.id === transactionId ? { ...item, amount } : item
      );
      // 정렬 유지
      return [...updatedTransactions].sort((a, b) => b.timestamp - a.timestamp);
    });
    setEditingId(null);
    setEditValue('');
  };

  // 삭제하기 함수
  const handleDelete = transactionId => {
    Alert.alert('거래 내역 삭제', '이 거래 내역을 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          setTransactions(prev => {
            const filteredTransactions = prev.filter(item => item.id !== transactionId);
            // 정렬 유지 (여기서는 이미 정렬된 상태에서 항목만 제거하므로 재정렬 필요 없음)
            return filteredTransactions;
          });
        },
        style: 'destructive',
      },
    ]);
  };

  // amount 표시 함수
  const renderAmount = (amount, type) => {
    const prefix = type === 'payment' ? '-' : '';
    return `${prefix}${formatNumber(amount)}원`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="chevron-left" type="feather" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 사용내역
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {scope === 'USED' && usageType !== 'SELF_USE' ? (
          <View style={styles.noAccessContainer}>
            <Text style={styles.noAccessText}>
              직접 사용한 기프티콘만 사용내역을 확인할 수 있습니다.
            </Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.infoHeaderContainer}>
              <Text style={styles.brandText}>{gifticonData.brand}</Text>
              <Text style={styles.nameText}>{gifticonData.name}</Text>
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
                <Text style={[styles.balanceValue, { color: '#56AEE9' }]}>
                  {formatNumber(gifticonData.remainingBalance)}원
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* 거래 내역 */}
            <View style={styles.transactionsContainer}>
              {transactions.map(transaction => (
                <View key={transaction.id}>
                  {editingId === transaction.id ? (
                    <View style={styles.editItemContainer}>
                      <View style={styles.editInfoSection}>
                        <Text style={styles.transactionUser}>{transaction.userName}</Text>
                        <Text style={styles.transactionDate}>{transaction.date}</Text>
                      </View>
                      <View style={styles.editActionSection}>
                        <TextInput
                          style={styles.editInput}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="numeric"
                          placeholder="금액 입력"
                        />
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, styles.saveButton]}
                          onPress={() => handleSaveEdit(transaction.id)}
                        >
                          <Text style={styles.saveButtonText}>수정</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.transactionItem}>
                      <View style={styles.transactionLeft}>
                        <Text style={styles.transactionUser}>{transaction.userName}</Text>
                        <Text style={styles.transactionDate}>{transaction.date}</Text>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={[styles.amountText, { color: '#56AEE9' }]}>
                          {renderAmount(transaction.amount, transaction.type)}
                        </Text>
                        <View style={styles.actionIcons}>
                          <TouchableOpacity
                            onPress={() => handleEdit(transaction.id)}
                            style={styles.iconButton}
                          >
                            <Icon name="edit" type="feather" size={20} color="#AAAAAA" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(transaction.id)}
                            style={styles.iconButton}
                          >
                            <Icon name="trash-2" type="feather" size={20} color="#AAAAAA" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 24,
  },
  infoHeaderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  nameText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  balanceSection: {
    marginTop: 10,
    borderRadius: 12,
    padding: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#737373',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    marginVertical: 20,
  },
  transactionsContainer: {
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#737373',
    marginTop: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#278CCC',
    marginRight: 15,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 2,
    marginLeft: 4,
  },
  editItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  editInfoSection: {
    marginBottom: 12,
  },
  editActionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  editButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#CDE7F9',
  },
  saveButton: {
    backgroundColor: '#56AEE9',
  },
  cancelButtonText: {
    color: '#56AEE9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noAccessContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  noAccessText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BoxDetailAmountHistoryScreen;
