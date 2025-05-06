// 금액형 사용 스크린

import React from 'react';
import { View, StyleSheet, Image, StatusBar, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';

const UseCashScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // route.params에서 바코드 정보 가져오기
  const barcodeNumber = route.params?.barcodeNumber || '23424-325235-2352525-45345';

  // 뒤로가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 뒤로가기 버튼 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" type="material" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 바코드 표시 영역 */}
      <View style={styles.barcodeContainer}>
        <Image
          source={require('../../../assets/images/barcode.png')}
          style={styles.barcodeImage}
          resizeMode="contain"
        />

        <Text style={styles.barcodeNumberText}>{barcodeNumber}</Text>
      </View>

      {/* 사용 안내 메시지 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>바코드를 계산대에 스캔해주세요</Text>
        <Text style={styles.balanceText}>잔액: 10,000원</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  barcodeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  barcodeImage: {
    width: '100%',
    height: '40%',
    marginBottom: 20,
  },
  barcodeNumberText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  instructionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 8,
  },
});

export default UseCashScreen;
