package com.eurachacha.achacha.application.port.output.notification;

import com.eurachacha.achacha.domain.model.notification.Notification;

public interface NotificationRepository {
	Notification save(Notification notification);
}
