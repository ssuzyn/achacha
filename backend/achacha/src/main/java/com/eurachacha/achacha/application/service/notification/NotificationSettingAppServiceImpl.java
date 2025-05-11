package com.eurachacha.achacha.application.service.notification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.notification.NotificationSettingAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationSettingDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationSettingAppServiceImpl implements NotificationSettingAppService {

	private final NotificationSettingRepository notificationSettingRepository;
	private final SecurityServicePort securityServicePort;

	@Override
	public List<NotificationSettingDto> getUserNotificationSettings() {
		// User user = securityServicePort.getLoggedInUser();
		Integer userId = 1;

		List<NotificationSetting> settings = notificationSettingRepository.findAllByUserId(userId);

		return settings.stream()
			.map(setting -> NotificationSettingDto.builder()
				.notificationSettingId(setting.getId())
				.notificationType(setting.getNotificationType().getCode())
				.notificationTypeName(setting.getNotificationType().getCode().getDisplayName())
				.isEnabled(setting.getIsEnabled())
				.expirationCycle(setting.getExpirationCycle())
				.build())
			.collect(Collectors.toList());
	}
}
