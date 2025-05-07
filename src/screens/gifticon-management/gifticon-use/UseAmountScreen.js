/* eslint-disable react-native/no-inline-styles */
// 금액형 사용 스크린

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';

const UseAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const insets = useSafeAreaInsets();

  // route.params에서 정보 가져오기
  const { barcodeNumber } = route.params || {};

  // 기본 상품 정보
  const productInfo = {
    name: '스타벅스 | APP전용 e카드 3만원 교환권',
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

  // 금액 입력 모달 표시
  const handleShowModal = () => {
    setModalVisible(true);
  };

  // 모달 취소
  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount('');
  };

  // 금액 입력 완료 및 사용완료 처리
  const handleUseComplete = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      // console.log('유효한 금액을 입력해주세요');
      // 알림 처리 (예: 토스트 메시지)
      return;
    }

    // console.log(`사용 금액: ${amount}원 사용 완료`);

    // 사용완료 처리 로직 - API 호출 등

    // 사용완료 후 ManageListScreen으로 이동하면서 네비게이션 스택 초기화
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
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <StatusBar hidden />

      {/* 좌측 Safe Area */}
      <View style={{ width: insets.left, height: '100%' }} />

      <View style={styles.mainContent}>
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
            <TouchableOpacity style={styles.actionButton} onPress={handleShowModal}>
              <Text style={styles.actionButtonText}>금액 입력</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 우측 Safe Area */}
      <View style={{ width: insets.right, height: '100%' }} />

      {/* 금액 입력 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>사용 금액 입력</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                maxLength={10}
              />
              <Text style={styles.wonText}>원</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleUseComplete}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // 가로 모드에서 좌우 안전 영역을 위해 row로 변경
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
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
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 10,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 150,
    marginRight: 5,
  },
  wonText: {
    fontSize: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#F2F2F2',
  },
  confirmModalButton: {
    backgroundColor: '#56AEE9',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default UseAmountScreen;
