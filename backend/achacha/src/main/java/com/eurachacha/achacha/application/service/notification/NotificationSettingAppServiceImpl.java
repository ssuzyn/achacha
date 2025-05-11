package com.eurachacha.achacha.application.service.notification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.notification.NotificationSettingAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationSettingDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationSettingAppServiceImpl implements NotificationSettingAppService {

	private final NotificationSettingRepository notificationSettingRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingDomainService notificationSettingDomainService;
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

	@Override
	@Transactional
	public void updateNotificationSetting(NotificationTypeCode typeCode, Boolean isEnabled) {
		// User user = securityServicePort.getLoggedInUser();
		Integer userId = 1;

		// 알림 타입 찾기
		NotificationType notificationType = notificationTypeRepository.findByCode(typeCode);

		// 사용자 ID와 알림 타입 ID로 설정 직접 찾기
		NotificationSetting setting = notificationSettingRepository
			.findByUserIdAndNotificationTypeId(userId, notificationType.getId());

		setting.updateIsEnabled(isEnabled);
	}

	@Override
	@Transactional
	public void updateExpirationCycle(ExpirationCycle expirationCycle) {
		// User user = securityServicePort.getLoggedInUser();
		Integer userId = 1;

		// 알림 타입 찾기
		NotificationType notificationType = notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE);

		// 사용자 ID와 알림 타입 ID로 설정 직접 찾기
		NotificationSetting setting = notificationSettingRepository
			.findByUserIdAndNotificationTypeId(userId, notificationType.getId());

		if (!notificationSettingDomainService.isEnabled(setting)) {
			throw new CustomException(ErrorCode.NOTIFICATION_SETTING_DISABLED);
		}

		setting.updateExpirationCycle(expirationCycle);
	}
}
