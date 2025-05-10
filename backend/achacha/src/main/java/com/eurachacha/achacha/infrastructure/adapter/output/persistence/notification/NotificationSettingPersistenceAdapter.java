package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationSettingPersistenceAdapter implements NotificationSettingRepository {

	private final NotificationSettingJpaRepository notificationSettingJpaRepository;

	@Override
	public NotificationSetting save(NotificationSetting notificationSetting) {
		return notificationSettingJpaRepository.save(notificationSetting);
	}

	@Override
	public List<NotificationSetting> saveAll(List<NotificationSetting> notificationSettings) {
		return notificationSettingJpaRepository.saveAll(notificationSettings);
	}
}
