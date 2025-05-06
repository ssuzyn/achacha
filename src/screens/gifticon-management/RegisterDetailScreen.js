// 기프티콘 등록 상세 스크린

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import { Button, InputLine, Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon as RNEIcon } from 'react-native-elements';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { ImageCropView } from 'react-native-image-crop-tools';

const RegisterDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const cropViewRef = useRef(null);
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('상품형'); // '상품형' 또는 '금액형'
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageEditorVisible, setImageEditorVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);

  // 네비게이션으로부터 선택된 이미지 불러오기
  useEffect(() => {
    if (route.params?.selectedImage) {
      setSelectedImage(route.params.selectedImage);
    }
  }, [route.params]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShowDatePicker = () => {
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setDatePickerVisible(false);
      return;
    }

    const currentDate = selectedDate || date;
    setDate(currentDate);

    // 선택한 날짜를 년.월.일 형식으로 포맷팅
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setExpiryDate(`${year}.${month}.${day}`);

    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
  };

  // iOS에서 DatePicker 닫기
  const handleIOSConfirm = () => {
    setDatePickerVisible(false);
  };

  // 안드로이드 카메라 권한 요청
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: '카메라 접근 권한',
          message: '기프티콘 등록을 위해 카메라 접근 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '취소',
          buttonPositive: '확인',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // 갤러리에서 이미지 선택
  const handlePickImage = () => {
    console.log('갤러리 버튼 클릭됨');

    try {
      // 옛날 버전 사용 방식으로 변경
      const options = {
        title: '이미지 선택',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      };

      console.log('launchImageLibrary 호출 전');

      // 구 버전 API 호출 (8.x)
      launchImageLibrary(options, response => {
        console.log('이미지 선택 응답:', JSON.stringify(response));

        if (response.didCancel) {
          console.log('사용자가 이미지 선택을 취소했습니다');
        } else if (response.error) {
          console.error('이미지 선택 오류: ', response.error);
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          console.log('이미지 선택 성공:', response.uri);
          // 선택한 이미지 편집 모드 시작
          setCurrentImageUri(response.uri);
          setImageEditorVisible(true);
        }
      });

      console.log('launchImageLibrary 호출 후');
    } catch (error) {
      console.error('이미지 선택 예외 발생:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 카메라로 촬영
  const handleOpenCamera = async () => {
    console.log('카메라 버튼 클릭됨');

    try {
      const hasPermission = await requestCameraPermission();
      console.log('카메라 권한 상태:', hasPermission);

      if (!hasPermission) {
        Alert.alert('권한 없음', '카메라를 사용하기 위해 권한이 필요합니다.');
        return;
      }

      // 옛날 버전 사용 방식으로 변경
      const options = {
        title: '사진 촬영',
        storageOptions: {
          skipBackup: true,
          path: 'images',
          cameraRoll: true,
          waitUntilSaved: true,
        },
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      };

      console.log('launchCamera 호출 전');

      // 구 버전 API 호출 (8.x)
      launchCamera(options, response => {
        console.log('카메라 응답:', JSON.stringify(response));

        if (response.didCancel) {
          console.log('사용자가 카메라 촬영을 취소했습니다');
        } else if (response.error) {
          console.error('카메라 오류: ', response.error);
          Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다: ' + response.error);
        } else {
          console.log('카메라 촬영 성공:', response.uri);
          // 선택한 이미지 편집 모드 시작
          setCurrentImageUri(response.uri);
          setImageEditorVisible(true);
        }
      });

      console.log('launchCamera 호출 후');
    } catch (error) {
      console.error('카메라 촬영 예외 발생:', error);
      Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
    }
  };

  // 이미지 편집 완료 후 처리
  const handleImageEditComplete = () => {
    console.log('이미지 편집 완료 버튼 클릭됨');
    if (cropViewRef.current) {
      try {
        cropViewRef.current
          .saveImage(true, 90)
          .then(result => {
            console.log('이미지 크롭 성공:', result.uri);
            setSelectedImage({ uri: result.uri });
            setImageEditorVisible(false);
          })
          .catch(error => {
            console.error('이미지 저장 오류:', error);
            Alert.alert('오류', '이미지를 저장하는 중 오류가 발생했습니다.');
            setImageEditorVisible(false);
          });
      } catch (error) {
        console.error('이미지 편집 예외 발생:', error);
        Alert.alert('오류', '이미지를 편집하는 중 문제가 발생했습니다.');
        setImageEditorVisible(false);
      }
    }
  };

  // 이미지 편집 취소
  const handleImageEditCancel = () => {
    console.log('이미지 편집 취소됨');
    setImageEditorVisible(false);
  };

  // 이미지 선택 옵션 모달
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);

  const showImageOptions = () => {
    setImageOptionVisible(true);
  };

  // DatePicker 렌더링
  const renderDatePicker = () => {
    // 공통 DateTimePicker 속성
    const dateTimePickerProps = {
      value: date,
      mode: 'date',
      onChange: handleDateChange,
    };

    if (Platform.OS === 'ios') {
      // iOS는 모달로 표시하지 않고 항상 화면에 표시
      return (
        <Modal visible={isDatePickerVisible} transparent animationType="slide">
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerContent}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                  <Text variant="body1" weight="bold" color="#56AEE9">
                    취소
                  </Text>
                </TouchableOpacity>
                <Text variant="h4" weight="bold">
                  날짜 선택
                </Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text variant="body1" weight="bold" color="#56AEE9">
                    확인
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                {...dateTimePickerProps}
                display="spinner"
                themeVariant="light"
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      );
    }

    // Android는 네이티브 다이얼로그로 표시
    return isDatePickerVisible && <DateTimePicker {...dateTimePickerProps} display="default" />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={
            <RNEIcon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          }
        />
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 등록
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 기프티콘 이미지 */}
        <View style={styles.imageContainer}>
          <View style={styles.image}>
            {selectedImage ? (
              <Image source={selectedImage} style={styles.productImage} />
            ) : (
              <View style={styles.emptyImageContainer}>
                <Icon name="image" size={50} color="#CCCCCC" />
                <Text variant="body2" color="#999999" style={styles.emptyImageText}>
                  이미지 없음
                </Text>
              </View>
            )}
          </View>
          <Button
            title={selectedImage ? '편집하기' : '등록하기'}
            variant="outline"
            size="sm"
            style={styles.editButton}
            onPress={showImageOptions}
          />
        </View>

        {/* 탭 필터 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === '상품형' && styles.activeTab]}
            onPress={() => setActiveTab('상품형')}
          >
            <Text
              variant="body1"
              weight={activeTab === '상품형' ? 'bold' : 'regular'}
              color={activeTab === '상품형' ? '#00B388' : '#666666'}
            >
              상품형
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === '금액형' && styles.activeTab]}
            onPress={() => setActiveTab('금액형')}
          >
            <Text
              variant="body1"
              weight={activeTab === '금액형' ? 'bold' : 'regular'}
              color={activeTab === '금액형' ? '#00B388' : '#666666'}
            >
              금액형
            </Text>
          </TouchableOpacity>
        </View>

        {/* 바코드 번호 입력 */}
        <View style={styles.inputSection}>
          <Text variant="h4" weight="bold" style={styles.sectionTitle}>
            바코드 번호 입력
          </Text>
          <InputLine
            placeholder="바코드 번호를 입력해주세요."
            value={barcodeNumber}
            onChangeText={setBarcodeNumber}
          />
        </View>

        {/* 기프티콘 정보 입력 */}
        <View style={styles.inputSection}>
          <Text variant="h4" weight="bold" style={styles.sectionTitle}>
            기프티콘 정보 입력
          </Text>
          <InputLine
            placeholder="브랜드명을 입력해주세요."
            value={brandName}
            onChangeText={setBrandName}
            style={styles.inputMargin}
          />
          <InputLine
            placeholder="상품명을 입력해주세요."
            value={productName}
            onChangeText={setProductName}
            style={styles.inputMargin}
          />
          <TouchableOpacity onPress={handleShowDatePicker} style={styles.inputMargin}>
            <InputLine
              placeholder="유효기간을 선택해주세요."
              value={expiryDate}
              editable={false}
              rightIcon={<Icon name="calendar-today" size={20} color={theme.colors.grey5} />}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 등록 버튼 */}
      <View style={styles.footer}>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Text variant="body2" color="#666666">
              기본
            </Text>
          </TouchableOpacity>
          <Text variant="body2" color="#EEEEEE">
            |
          </Text>
          <TouchableOpacity style={styles.tabItem}>
            <Text variant="body2" weight="bold" color="#00B388">
              내 보관함
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectButton}>
            <Text variant="body2" color="#333333" style={{ marginRight: 4 }}>
              선택
            </Text>
            <Icon name="chevron-right" size={20} color="#333333" />
          </TouchableOpacity>
        </View>
        <Button title="등록" variant="primary" size="lg" style={styles.registerButton} />
      </View>

      {/* 이미지 옵션 모달 */}
      <Modal
        visible={isImageOptionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageOptionVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageOptionVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              이미지 선택
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handlePickImage();
              }}
            >
              <Icon name="photo-library" size={24} color="#333333" style={styles.modalOptionIcon} />
              <Text variant="body1">갤러리에서 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handleOpenCamera();
              }}
            >
              <Icon name="camera-alt" size={24} color="#333333" style={styles.modalOptionIcon} />
              <Text variant="body1">카메라로 촬영</Text>
            </TouchableOpacity>
            <Button
              title="취소"
              variant="outline"
              onPress={() => setImageOptionVisible(false)}
              style={styles.modalCancelButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 이미지 편집 모달 */}
      <Modal visible={isImageEditorVisible} animationType="slide">
        <View style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={handleImageEditCancel} style={styles.editorHeaderButton}>
              <Text variant="body1" weight="bold" color="#56AEE9">
                취소
              </Text>
            </TouchableOpacity>
            <Text variant="h4" weight="bold" color="white">
              이미지 편집
            </Text>
            <TouchableOpacity onPress={handleImageEditComplete} style={styles.editorHeaderButton}>
              <Text variant="body1" weight="bold" color="#56AEE9">
                적용
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cropContainer}>
            {currentImageUri && (
              <ImageCropView
                ref={cropViewRef}
                imageUri={currentImageUri}
                style={styles.cropView}
                cropAreaWidth={Dimensions.get('window').width * 0.9}
                cropAreaHeight={Dimensions.get('window').width * 0.9}
                containerColor="rgba(0, 0, 0, 0.8)"
                areaColor="rgba(255, 255, 255, 0.3)"
              />
            )}
          </View>

          <View style={styles.editorToolbar}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => {
                console.log('회전 버튼 클릭');
                cropViewRef.current?.rotateImage(true);
              }}
            >
              <Icon name="rotate-right" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                회전
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => {
                console.log('좌우반전 버튼 클릭');
                cropViewRef.current?.flipImage('horizontal');
              }}
            >
              <Icon name="flip" size={24} color="#FFFFFF" />
              <Text variant="body2" color="#FFFFFF" style={styles.toolbarButtonText}>
                좌우반전
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker */}
      {renderDatePicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 48,
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
  inputSection: {
    marginBottom: 16,
  },
  sectionTitle: {
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
    marginHorizontal: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#56AEE9',
  },
  iosPickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iosPickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iosPicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalCancelButton: {
    marginTop: 16,
  },
  emptyImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImageText: {
    marginTop: 8,
  },
  // 이미지 편집기 관련 스타일
  editorContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  editorHeaderButton: {
    padding: 8,
  },
  cropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropView: {
    width: '100%',
    height: '100%',
  },
  editorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  toolbarButtonText: {
    marginTop: 8,
  },
});

export default RegisterDetailScreen;
