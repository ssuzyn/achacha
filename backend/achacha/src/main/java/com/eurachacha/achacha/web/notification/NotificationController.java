package com.eurachacha.achacha.web.notification;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.notification.NotificationSettingAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationSettingDto;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/notification-settings")
@RestController
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationSettingAppService notificationSettingAppService;

	@GetMapping
	public ResponseEntity<List<NotificationSettingDto>> getUserNotificationSettings() {
		List<NotificationSettingDto> settings = notificationSettingAppService.getUserNotificationSettings();
		return ResponseEntity.ok(settings);
	}
}
