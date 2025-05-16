package com.eurachacha.achacha.notification.service;

public interface FcmService {
	void sendNotification(String fcmToken, String title, String body);
}
