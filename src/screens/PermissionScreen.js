import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// const ICON_WRAPPER_SIZE = 40; // 배경 크기 상수 제거
const ICON_SIZE = 28; // 아이콘 크기 상수 추가
const ICON_MARGIN_RIGHT = 5;

const PermissionItem = ({ iconName, title, description }) => (
  <View style={styles.permissionItemContainer}>
    {/* 상단 행: 아이콘 + 제목 */}
    <View style={styles.itemTopRow}>
      {/* 아이콘 배경 제거, 아이콘 바로 표시 */}
      {/* <View style={styles.iconWrapper}> */}
        <MaterialIcons name={iconName} size={ICON_SIZE} style={styles.icon} />
      {/* </View> */}
      <Text style={styles.permissionTitle}>{title}</Text>
    </View>
    {/* 하단 행: 설명 */}
    <Text style={styles.permissionDescription}>{description}</Text>
  </View>
);

const PermissionScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>ㅇㅊㅊ</Text>
          <Text style={styles.headerTitle}>이용을 위해</Text>
          <Text style={styles.headerTitle}>아래 권한을 허용해주세요.</Text>
        </View>

        <View style={styles.permissionsListContainer}>
          <PermissionItem
            iconName="notifications"
            title="알림"
            description="기프티콘 유효기간 및 위치 기반 알림을 받기 위해 알림 권한이 필요합니다."
          />
          <PermissionItem
            iconName="bluetooth"
            title="블루투스"
            description="기프티콘 공유 및 위치 기반 알림 기능을 위해 블루투스 권한이 필요합니다."
          />
          <PermissionItem
            iconName="location-pin"
            title="위치"
            description="근처 매장 정보와 설정 변경 내 지도를 제공하기 위해 위치 권한이 필요합니다."
          />
          <PermissionItem
            iconName="photo-library"
            title="갤러리"
            description="기프티콘 이미지 업로드를 위하여 갤러리 접근 권한이 필요합니다."
          />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 30,
    textAlign: 'center',
  },
  permissionsListContainer: {
    width: '100%',
    alignItems: 'center',
  },
  permissionItemContainer: {
    marginBottom: 25,
    alignItems: 'center',
    width: '90%',
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    color: '#555',
    marginRight: ICON_MARGIN_RIGHT,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5dade2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PermissionScreen; 