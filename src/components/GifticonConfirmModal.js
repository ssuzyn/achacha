import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const StarbucksImg = require('../../assets/starbucks.png');

const GifticonConfirmModal = ({ visible, selectedGifticon, onCancel, onConfirm }) => {
  return (
    <Modal transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.confirmModalContainer}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.confirmModalTitle}>선택한 기프티콘을 뿌리시겠습니까?</Text>
          <Text style={styles.confirmModalSubtitle}>한 번 뿌린 기프티콘은 되돌릴 수 없습니다.</Text>
          {selectedGifticon && (
            <View style={styles.selectedGifticonCard}>
              <Image source={StarbucksImg} style={styles.gifticonImage} />
              <Text style={styles.gifticonBrand}>스타벅스</Text>
              <Text style={styles.gifticonName}>{selectedGifticon.gifticonName}</Text>
            </View>
          )}
          <View style={styles.confirmButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okButton} onPress={onConfirm}>
              <Text style={styles.okButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmModalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedGifticonCard: {
    width: '100%',
    backgroundColor: '#f1f7ff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  gifticonImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  gifticonBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  gifticonName: {
    fontSize: 15,
    color: 'black',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
  },
  okButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
    backgroundColor: '#56AEE9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#56AEE9',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default GifticonConfirmModal;
