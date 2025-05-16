package com.eurachacha.achacha.notification.service;

import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmServiceImpl implements FcmService {
	
	private final FirebaseMessaging firebaseMessaging;

	public void sendNotification(String fcmToken, String title, String body) {
		try {
			Message message = Message.builder()
				.setToken(fcmToken)
				.setNotification(Notification.builder()
					.setTitle(title)
					.setBody(body)
					.build())
				.build();

			String messageId = firebaseMessaging.send(message);
			log.info("Successfully sent FCM notification: {}", messageId);
		} catch (FirebaseMessagingException e) {
			log.error("Failed to send FCM notification: {}", e.getMessage());
		}
	}
}
