import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// 스토리지 키
const APP_UUID_KEY = '@app_uuid';
const USER_UUID_KEY = '@user_uuid';

// UUID 생성 함수
const generateUUID = () => uuidv4();

// UUID 스토어 정의
const useDeviceStore = create((set, get) => ({
  // 상태
  appUUID: null,
  userUUID: null,
  isInitialized: false,

  // 앱 시작시 UUID 초기화
  initializeUUIDs: async () => {
    try {
      // 앱 UUID 가져오기 (없으면 생성)
      let appUUID = await AsyncStorage.getItem(APP_UUID_KEY);
      if (!appUUID) {
        appUUID = generateUUID();
        await AsyncStorage.setItem(APP_UUID_KEY, appUUID);
        console.log('앱 UUID 생성됨:', appUUID);
      } else {
        console.log('저장된 앱 UUID 로드됨:', appUUID);
      }

      // 사용자 UUID 가져오기 (없으면 null로 설정)
      let userUUID = await AsyncStorage.getItem(USER_UUID_KEY);
      if (userUUID) {
        console.log('저장된 사용자 UUID 로드됨:', userUUID);
      } else {
        console.log('사용자 UUID가 없습니다. 로그인 후 백엔드에서 받아야 합니다.');
      }

      // 상태 업데이트
      set({
        appUUID,
        userUUID,
        isInitialized: true,
      });

      return { appUUID, userUUID };
    } catch (error) {
      console.error('UUID 초기화 중 오류:', error);
      return { error };
    }
  },

  // 백엔드에서 받은 사용자 UUID 설정
  setUserUUID: async backendUserUUID => {
    try {
      if (!backendUserUUID) {
        console.error('유효하지 않은 UUID입니다');
        return { error: '유효하지 않은 UUID' };
      }

      // 백엔드에서 받은 UUID 저장
      await AsyncStorage.setItem(USER_UUID_KEY, backendUserUUID);
      set({ userUUID: backendUserUUID });
      console.log('백엔드 사용자 UUID 설정됨:', backendUserUUID);
      return { success: true, userUUID: backendUserUUID };
    } catch (error) {
      console.error('사용자 UUID 설정 중 오류:', error);
      return { error };
    }
  },

  // 사용자 UUID 재설정 (필요시)
  resetUserUUID: async () => {
    try {
      const newUserUUID = generateUUID();
      await AsyncStorage.setItem(USER_UUID_KEY, newUserUUID);
      set({ userUUID: newUserUUID });
      console.log('사용자 UUID 재설정됨:', newUserUUID);
      return { success: true, userUUID: newUserUUID };
    } catch (error) {
      console.error('사용자 UUID 재설정 중 오류:', error);
      return { error };
    }
  },

  // UUID 가져오기 (이미 초기화된 경우)
  getUUIDs: () => {
    const { appUUID, userUUID, isInitialized } = get();
    if (!isInitialized) {
      console.warn('UUID가 아직 초기화되지 않았습니다.');
      return { error: 'UUID가 초기화되지 않음' };
    }
    return { appUUID, userUUID };
  },
}));

export default useDeviceStore;
