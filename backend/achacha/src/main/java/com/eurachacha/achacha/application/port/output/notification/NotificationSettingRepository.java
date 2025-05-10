package com.eurachacha.achacha.application.port.output.notification;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

public interface NotificationSettingRepository {

	NotificationSetting save(NotificationSetting notificationSetting);

}
