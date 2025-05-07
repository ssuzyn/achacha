// 상품형 사용 스크린

import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { Text } from '../../../components/ui';

const UseProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // route.params에서 정보 가져오기
  const { barcodeNumber } = route.params || {};

  // 기본 상품 정보
  const productInfo = {
    name: '스타벅스 | 아이스 카페 아메리카노 T',
    barcodeNumber: barcodeNumber || '23424-325235-2352525-45345',
    barcodeImage: require('../../../assets/images/barcode.png'),
  };

  // 화면 로드 시 가로 모드로 설정
  useEffect(() => {
    // 가로 모드로 고정
    Orientation.lockToLandscape();

    // 컴포넌트 언마운트 시 원래 모드로 복귀
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  // 뒤로가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 사용 완료 처리
  const handleUseComplete = () => {
    // 사용 완료 처리 로직
    console.log('사용 완료');

    // API 호출로 기프티콘 상태를 사용완료로 변경 (실제 구현 시 주석 해제)
    // 예: await api.updateGifticonStatus(id, 'USED');

    // 가로 모드에서 세로 모드로 전환
    Orientation.lockToPortrait();

    // ManageListScreen으로 이동하면서 네비게이션 스택 초기화
    // 사용완료 탭으로 바로 이동하기 위한 파라미터 전달
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Main',
          params: { screen: 'TabGifticonManage', initialTab: 'used' },
        },
      ],
    });
  };

  // 취소 처리
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <StatusBar hidden />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back-ios" type="material" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{productInfo.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.barcodeSection}>
          <Image
            source={productInfo.barcodeImage}
            style={styles.barcodeImage}
            resizeMode="contain"
          />
          <Text style={styles.barcodeNumber}>{productInfo.barcodeNumber}</Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUseComplete}>
            <Text style={styles.actionButtonText}>사용완료</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  barcodeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  barcodeImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
  },
  barcodeNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
  },
  actionSection: {
    width: 150,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    color: '#278CCC',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UseProductScreen;
