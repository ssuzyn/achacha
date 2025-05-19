package com.eurachacha.achacha.application.port.input.notification;

import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;

public interface AsyncNotificationAppService {
	void handleNotificationEvent(NotificationEventMessage event);
}
