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
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import gifticonService from '../../api/gifticonService';

const BoxDetailAmountHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showTabBar } = useTabBar();
  const route = useRoute();
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [scope, setScope] = useState('SHARE_BOX'); // 기본값을 SHARE_BOX로 변경
  const [usageType, setUsageType] = useState(null);
  const [gifticonData, setGifticonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 바텀탭 표시 및 데이터 로드
  useEffect(() => {
    showTabBar();

    // 라우트 파라미터에서 scope와 usageType, id 정보 가져오기
    let gifticonId = null;
    if (route.params) {
      if (route.params.scope) {
        setScope(route.params.scope);
      }
      if (route.params.usageType) {
        setUsageType(route.params.usageType);
      }
      if (route.params.id) {
        gifticonId = route.params.id;
      }
    }

    if (gifticonId) {
      // 실제 API 호출
      (async () => {
        setIsLoading(true);
        try {
          const data = await gifticonService.getAmountGifticonUsageHistory(gifticonId);
          // usageHistories 변환
          const transactions = (data.usageHistories || []).map(item => ({
            id: item.usageHistoryId?.toString(),
            userName: item.userName,
            amount: item.usageAmount,
            date: formatDateTime(item.usageHistoryCreatedAt), // YYYY.MM.DD HH:mm
            type: 'payment',
            timestamp: new Date(item.usageHistoryCreatedAt).getTime(),
          })).sort((a, b) => b.timestamp - a.timestamp);
          setTransactions(transactions);
          setGifticonData(data);
        } catch (e) {
          setTransactions([]);
          setGifticonData(null);
          Alert.alert('오류', '기프티콘 사용내역을 불러오지 못했습니다.');
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, []);

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  };

  // 뒤로가기 함수
  const handleGoBack = () => {
    console.log('[BoxDetailAmountHistoryScreen] 뒤로가기 버튼 클릭');
    const params = { 
      refresh: true, 
      gifticonId: gifticonData?.gifticonId || gifticonData?.id,
      scope: scope,
      brandName: route.params?.brandName || gifticonData?.brandName,
      gifticonName: route.params?.gifticonName || gifticonData?.gifticonName
    };
    console.log('[BoxDetailAmountHistoryScreen] 전달할 파라미터:', params);
    navigation.goBack(params);
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
  const handleSaveEdit = async transactionId => {
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('유효하지 않은 금액', '올바른 금액을 입력하세요.');
      return;
    }

    // gifticonId, usageHistoryId 필요
    const usageHistoryId = transactionId;
    const gifticonId = gifticonData.gifticonId || gifticonData.id;

    try {
      await gifticonService.updateAmountGifticonUsageHistory(gifticonId, usageHistoryId, amount);
      Alert.alert('수정 완료', '사용내역이 성공적으로 수정되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // 목록 새로고침
            if (gifticonId) {
              (async () => {
                setIsLoading(true);
                try {
                  const data = await gifticonService.getAmountGifticonUsageHistory(gifticonId);
                  const transactions = (data.usageHistories || []).map(item => ({
                    id: item.usageHistoryId?.toString(),
                    userName: item.userName,
                    amount: item.usageAmount,
                    date: formatDateTime(item.usageHistoryCreatedAt),
                    type: 'payment',
                    timestamp: new Date(item.usageHistoryCreatedAt).getTime(),
                  })).sort((a, b) => b.timestamp - a.timestamp);
                  setTransactions(transactions);
                  setGifticonData(data);
                } catch (e) {
                  setTransactions([]);
                  setGifticonData(null);
                  Alert.alert('오류', '기프티콘 사용내역을 불러오지 못했습니다.');
                } finally {
                  setIsLoading(false);
                }
              })();
            }
            setEditingId(null);
            setEditValue('');
          },
        },
      ]);
    } catch (e) {
      Alert.alert('수정 실패', '사용내역 수정에 실패했습니다.');
    }
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
        onPress: async () => {
          const usageHistoryId = transactionId;
          const gifticonId = gifticonData.gifticonId || gifticonData.id;
          try {
            await gifticonService.deleteAmountGifticonUsageHistory(gifticonId, usageHistoryId);
            // 삭제 성공 시 목록 새로고침
            setIsLoading(true);
            try {
              const data = await gifticonService.getAmountGifticonUsageHistory(gifticonId);
              const transactions = (data.usageHistories || []).map(item => ({
                id: item.usageHistoryId?.toString(),
                userName: item.userName,
                amount: item.usageAmount,
                date: formatDateTime(item.usageHistoryCreatedAt),
                type: 'payment',
                timestamp: new Date(item.usageHistoryCreatedAt).getTime(),
              })).sort((a, b) => b.timestamp - a.timestamp);
              setTransactions(transactions);
              setGifticonData(data);
            } catch (e) {
              setTransactions([]);
              setGifticonData(null);
              Alert.alert('오류', '기프티콘 사용내역을 불러오지 못했습니다.');
            } finally {
              setIsLoading(false);
            }
            Alert.alert('삭제 완료', '거래 내역이 성공적으로 삭제되었습니다.');
          } catch (e) {
            Alert.alert('삭제 실패', '거래 내역 삭제에 실패했습니다.');
          }
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

  const formatDateTime = dateString => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      console.log('[BoxDetailAmountHistoryScreen] 화면 포커스됨');
      const gifticonId = route.params?.id;
      if (gifticonId) {
        (async () => {
          setIsLoading(true);
          try {
            const data = await gifticonService.getAmountGifticonUsageHistory(gifticonId);
            const transactions = (data.usageHistories || []).map(item => ({
              id: item.usageHistoryId?.toString(),
              userName: item.userName,
              amount: item.usageAmount,
              date: formatDateTime(item.usageHistoryCreatedAt),
              type: 'payment',
              timestamp: new Date(item.usageHistoryCreatedAt).getTime(),
            })).sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(transactions);
            setGifticonData(data);
          } catch (e) {
            setTransactions([]);
            setGifticonData(null);
            Alert.alert('오류', '기프티콘 사용내역을 불러오지 못했습니다.');
          } finally {
            setIsLoading(false);
          }
        })();
      }
    }, [route.params?.id])
  );

  console.log('[HISTORY PAGE] brandName:', route.params?.brandName, 'gifticonName:', route.params?.gifticonName);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, flex: 1, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: '#666', fontSize: 16 }}>로딩 중...</Text>
      </View>
    );
  }

  // gifticonData가 없으면 안내
  if (!gifticonData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, flex: 1, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: '#666', fontSize: 16 }}>기프티콘 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

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
              <Text weight="bold" style={styles.brandText}>
                {route.params?.brandName || gifticonData.brandName || gifticonData.brand || '-'}
              </Text>
              <Text style={styles.nameText}>
                {route.params?.gifticonName || gifticonData.gifticonName || gifticonData.name || '-'}
              </Text>
            </View>

            {/* 잔액 정보 */}
            <View style={styles.balanceSection}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>총 금액</Text>
                <Text weight="bold" style={styles.balanceValue}>
                  {formatNumber(gifticonData.gifticonOriginalAmount || gifticonData.amount)}원
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>사용 금액</Text>
                <Text weight="bold" style={styles.balanceValue}>
                  {formatNumber(gifticonData.gifticonUsedAmount || gifticonData.usedAmount)}원
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>남은 금액</Text>
                <Text weight="bold" style={[styles.balanceValue, { color: '#56AEE9' }]}>
                  {formatNumber(gifticonData.gifticonRemainingAmount || gifticonData.remainingBalance)}원
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
                        <Text weight="bold" style={styles.transactionUser}>
                          {transaction.userName}
                        </Text>
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
                        <Text weight="bold" style={styles.transactionUser}>
                          {transaction.userName}
                        </Text>
                        <Text style={styles.transactionDate}>{transaction.date}</Text>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text weight="bold" style={[styles.amountText, { color: '#56AEE9' }]}>
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
    marginVertical: 10,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 7,
  },
  nameText: {
    fontSize: 20,
    color: '#000',
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
    color: '#333',
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
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#737373',
    marginTop: 4,
  },
  amountText: {
    fontSize: 18,
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
    fontSize: 14,
  },
  saveButtonText: {
    color: 'white',
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
