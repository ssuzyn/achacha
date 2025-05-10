package com.eurachacha.achacha.application.port.output.notification;

import java.util.List;

import com.eurachacha.achacha.domain.model.notification.NotificationType;

public interface NotificationTypeRepository {

	List<NotificationType> findAll();
}
