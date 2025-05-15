package com.eurachacha.achacha.infrastructure.adapter.output.fcm;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.fcm.FcmServicePort;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class FcmServiceAdapter implements FcmServicePort {
	private final FirebaseMessaging firebaseMessaging;

	@Override
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
			log.info("Successfully sent message with ID: {}", messageId);
		} catch (Exception e) {
			log.error("Failed to send FCM notification: {}", e.getMessage());
		}
	}
}
