package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.domain.model.notification.NotificationType;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationTypePersistenceAdapter implements NotificationTypeRepository {

	private final NotificationTypeJpaRepository notificationTypeJpaRepository;

	@Override
	public List<NotificationType> findAll() {
		return notificationTypeJpaRepository.findAll();
	}
}