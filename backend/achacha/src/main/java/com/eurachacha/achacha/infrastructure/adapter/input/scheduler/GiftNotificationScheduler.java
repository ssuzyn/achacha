package com.eurachacha.achacha.infrastructure.adapter.input.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.input.notification.GifticonExpiryNotificationAppService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GiftNotificationScheduler {

	private final GifticonExpiryNotificationAppService gifticonExpiryNotificationAppService;

	@Scheduled(cron = "0 40 15 * * *")
	public void expirationScheduler() {
		gifticonExpiryNotificationAppService.sendExpiryDateNotification();
	}
}
