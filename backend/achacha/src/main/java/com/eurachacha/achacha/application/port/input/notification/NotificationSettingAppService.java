package com.eurachacha.achacha.application.port.input.notification;

import java.util.List;

import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationSettingDto;

public interface NotificationSettingAppService {
	List<NotificationSettingDto> getUserNotificationSettings();

}
