import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { getFcmToken } from '../services/NotificationService';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native-safe-area-context';

const FCMTestScreen = () => {
  const [fcmToken, setFcmToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [testTitle, setTestTitle] = useState('테스트 제목');
  const [testBody, setTestBody] = useState('테스트 내용');

  // FCM 토큰 가져오기
  useEffect(() => {
    const loadToken = async () => {
      const token = await getFcmToken();
      setFcmToken(token || '토큰을 가져올 수 없습니다');
    };

    loadToken();
  }, []);

  // 알림 수신 리스너 설정
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM 테스트 화면에서 알림 수신:', remoteMessage);
      setNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);

  // 토큰 복사 기능
  const copyTokenToClipboard = () => {
    Clipboard.setString(fcmToken);
    Alert.alert('알림', 'FCM 토큰이 클립보드에 복사되었습니다.');
  };

  // 로컬 테스트 알림 보내기
  const sendLocalNotification = () => {
    // 현재는 테스트용으로 간단하게 푸시 알림을 표시하는 Alert만 표시합니다.
    // 실제 로컬 알림은 react-native-push-notification 등의 라이브러리를 사용하여 구현할 수 있습니다.
    Alert.alert(testTitle, testBody);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.title}>FCM 테스트</Text>

          <View style={styles.tokenContainer}>
            <Text style={styles.sectionTitle}>디바이스 FCM 토큰:</Text>
            <Text style={styles.tokenText} selectable>
              {fcmToken}
            </Text>
            <Button title="토큰 복사" onPress={copyTokenToClipboard} />
            <Text style={styles.hint}>
              이 토큰을 복사한 후 Firebase 콘솔에서 테스트 메시지를 전송할 때 사용하세요.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.testContainer}>
            <Text style={styles.sectionTitle}>로컬 테스트:</Text>
            <TextInput
              style={styles.input}
              value={testTitle}
              onChangeText={setTestTitle}
              placeholder="알림 제목"
            />
            <TextInput
              style={styles.input}
              value={testBody}
              onChangeText={setTestBody}
              placeholder="알림 내용"
              multiline
            />
            <Button title="로컬 알림 테스트" onPress={sendLocalNotification} />
          </View>

          <View style={styles.divider} />

          {notification && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>마지막 수신된 알림:</Text>
              <View style={styles.notificationCard}>
                <Text style={styles.notificationTitle}>
                  {notification.notification?.title || '제목 없음'}
                </Text>
                <Text style={styles.notificationBody}>
                  {notification.notification?.body || '내용 없음'}
                </Text>
                <Text style={styles.notificationTime}>
                  수신 시간: {new Date().toLocaleString()}
                </Text>
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataTitle}>데이터:</Text>
                    <Text style={styles.dataContent}>
                      {JSON.stringify(notification.data, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>FCM 알림 테스트 방법:</Text>
            <Text style={styles.infoStep}>1. 위의 디바이스 토큰을 복사합니다.</Text>
            <Text style={styles.infoStep}>2. Firebase 콘솔에 접속합니다.</Text>
            <Text style={styles.infoStep}>3. Messaging 메뉴 → 새 알림 만들기를 선택합니다.</Text>
            <Text style={styles.infoStep}>4. 알림 제목과 내용을 입력합니다.</Text>
            <Text style={styles.infoStep}>5. 테스트 메시지 전송 → FCM 토큰을 선택합니다.</Text>
            <Text style={styles.infoStep}>6. 복사한 토큰을 붙여넣고 테스트를 완료합니다.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tokenContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  tokenText: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  testContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notificationBody: {
    fontSize: 16,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dataContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dataContent: {
    fontSize: 12,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoStep: {
    fontSize: 14,
    marginBottom: 6,
  },
});

export default FCMTestScreen;
