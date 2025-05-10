package com.eurachacha.achacha.application.port.output.notification;

import java.util.List;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

public interface NotificationSettingRepository {

	NotificationSetting save(NotificationSetting notificationSetting);

	List<NotificationSetting> saveAll(List<NotificationSetting> notificationSettings);

}
