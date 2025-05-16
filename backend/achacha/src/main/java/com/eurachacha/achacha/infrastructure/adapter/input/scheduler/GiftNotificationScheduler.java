package com.eurachacha.achacha.infrastructure.adapter.input.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.input.fcm.FcmAppService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GiftNotificationScheduler {

	private final FcmAppService fcmAppService;

	@Scheduled(cron = "0 0 9 * * *")
	public void expirationScheduler() {
		fcmAppService.sendExpiryDateNotification();
	}
}
