package com.eurachacha.achacha.application.port.output.fcm;

public interface FcmServicePort {
	// FCMToken에 해당하는 기기에 FCM 발송
	void sendNotification(String fcmToken, String title, String body);
}
