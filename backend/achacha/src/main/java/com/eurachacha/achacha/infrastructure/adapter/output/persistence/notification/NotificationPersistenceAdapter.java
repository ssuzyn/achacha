package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.domain.model.notification.Notification;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationPersistenceAdapter implements NotificationRepository {

	private final NotificationJpaRepository notificationJpaRepository;

	@Override
	public Notification save(Notification notification) {
		return notificationJpaRepository.save(notification);
	}
}
