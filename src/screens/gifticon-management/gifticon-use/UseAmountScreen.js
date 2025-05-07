// 금액형 사용 스크린

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { Text } from '../../../components/ui';

const UseAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

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
  const handleConfirmAmount = () => {
    // 금액 입력 값 검증
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      // 실제 구현에서는 오류 메시지 표시
      console.log('유효한 금액을 입력해주세요');
      return;
    }

    console.log(`사용 금액: ${amount}원 사용 완료`);

    // API 호출로 기프티콘 상태를 사용완료로 변경 (실제 구현 시 주석 해제)
    // 예: await api.updateGifticonStatus(id, 'USED', amount);

    // 모달 닫기
    setModalVisible(false);

    // 가로 모드에서 세로 모드로 전환
    Orientation.lockToPortrait();

    // 원래 상품 상세 페이지(DetailAmount)로 이동
    const { id } = route.params || {};
    navigation.navigate('DetailAmount', {
      gifticonId: id,
      refresh: true,
      usedAmount: amount,
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
          <TouchableOpacity style={styles.actionButton} onPress={handleShowModal}>
            <Text style={styles.actionButtonText}>금액 입력</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>

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
                onPress={handleConfirmAmount}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
