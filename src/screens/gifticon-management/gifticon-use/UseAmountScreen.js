// 금액형 사용 스크린

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { Text, Button } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';

const UseAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  // route.params에서 정보 가져오기
  const { id, barcodeNumber } = route.params || {};

  // 기본 상품 정보
  const productInfo = {
    name: '컬쳐랜드 | 문화상품권',
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
          <Icon name="arrow-back" type="material" size={28} color="#333" />
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
          <Button title="금액 입력" onPress={handleShowModal} style={styles.amountButton} />
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>취소</Text>
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
    paddingHorizontal: 20,
  },
  barcodeSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeImage: {
    width: '90%',
    height: '50%',
    marginBottom: 20,
  },
  barcodeNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
  },
  actionSection: {
    width: 100,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  amountButton: {
    backgroundColor: '#3498DB',
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 15,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '500',
  },
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
    backgroundColor: '#3498DB',
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
