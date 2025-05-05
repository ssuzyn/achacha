// 기프티콘 등록 상세 스크린

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Button, Input, Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const RegisterDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('상품권'); // '상품권' 또는 '금액권'

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShowDatePicker = () => {
    setDatePickerVisible(true);
  };

  const handleCloseDatePicker = () => {
    setDatePickerVisible(false);
  };

  // 간단한 날짜 선택 예시 (실제로는 더 정교한 DatePicker 구현이 필요)
  const handleSelectDate = () => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')}`;
    setExpiryDate(formattedDate);
    setDatePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기프티콘 등록</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 기프티콘 이미지 */}
        <View style={styles.imageContainer}>
          <View style={styles.image}>
            <Image
              source={require('../../assets/images/dummy-starbucks.png')}
              style={styles.productImage}
            />
          </View>
          <Button title="편집하기" variant="outline" size="sm" style={styles.editButton} />
        </View>

        {/* 탭 필터 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === '상품권' && styles.activeTab]}
            onPress={() => setActiveTab('상품권')}
          >
            <Text style={activeTab === '상품권' ? styles.activeTabText : styles.tabText}>
              상품권
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === '금액권' && styles.activeTab]}
            onPress={() => setActiveTab('금액권')}
          >
            <Text style={activeTab === '금액권' ? styles.activeTabText : styles.tabText}>
              금액권
            </Text>
          </TouchableOpacity>
        </View>

        {/* 바코드 번호 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>바코드 번호 입력</Text>
          <Input
            placeholder="바코드 번호를 입력해주세요."
            value={barcodeNumber}
            onChangeText={setBarcodeNumber}
            variant="outline"
            size="md"
          />
        </View>

        {/* 기프티콘 정보 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>기프티콘 정보 입력</Text>
          <Input
            placeholder="브랜드명을 입력해주세요."
            value={brandName}
            onChangeText={setBrandName}
            variant="outline"
            size="md"
            style={styles.inputMargin}
          />
          <Input
            placeholder="상품명을 입력해주세요."
            value={productName}
            onChangeText={setProductName}
            variant="outline"
            size="md"
            style={styles.inputMargin}
          />
          <TouchableOpacity onPress={handleShowDatePicker} style={styles.inputMargin}>
            <Input
              placeholder="유효기간을 선택해주세요."
              value={expiryDate}
              editable={false}
              variant="outline"
              size="md"
              rightIcon={<Icon name="calendar-today" size={20} color={theme.colors.grey5} />}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 등록 버튼 */}
      <View style={styles.footer}>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabText}>기본</Text>
          </TouchableOpacity>
          <Text style={styles.tabDivider}>|</Text>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.activeTabTextBottom}>내 보관함</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>선택</Text>
            <Icon name="chevron-right" size={20} color="#333333" />
          </TouchableOpacity>
        </View>
        <Button title="등록" variant="primary" size="lg" style={styles.registerButton} />
      </View>

      {/* 간단한 날짜 선택 모달 */}
      <Modal visible={isDatePickerVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>날짜 선택</Text>
            <Text style={styles.modalText}>현재 날짜를 유효기간으로 설정합니다.</Text>
            <View style={styles.modalButtons}>
              <Button
                title="취소"
                variant="outline"
                size="sm"
                style={styles.modalButton}
                onPress={handleCloseDatePicker}
              />
              <Button
                title="확인"
                variant="primary"
                size="sm"
                style={styles.modalButton}
                onPress={handleSelectDate}
              />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#E6F7F2',
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  editButton: {
    width: 100,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 4,
    marginVertical: 16,
    height: 40,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#E6F7F2',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#00B388',
  },
  inputSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputMargin: {
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabItem: {
    paddingHorizontal: 8,
  },
  tabDivider: {
    color: '#EEEEEE',
    marginHorizontal: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#333333',
    marginRight: 4,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#56AEE9',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  activeTabTextBottom: {
    fontWeight: 'bold',
    color: '#00B388',
  },
});

export default RegisterDetailScreen;
