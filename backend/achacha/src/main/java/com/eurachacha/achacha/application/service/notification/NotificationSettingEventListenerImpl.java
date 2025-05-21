package com.eurachacha.achacha.application.service.notification;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.eurachacha.achacha.application.port.input.notification.GifticonExpiryNotificationAppService;
import com.eurachacha.achacha.application.port.input.notification.NotificationSettingEventListener;
import com.eurachacha.achacha.application.service.notification.event.NotificationSettingUpdatedEvent;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationSettingEventListenerImpl implements NotificationSettingEventListener {

	private final GifticonExpiryNotificationAppService gifticonExpiryNotificationAppService;

	@Override
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleNotificationSettingUpdated(NotificationSettingUpdatedEvent event) {
		// EXPIRY_DATE 타입의 알림이 활성화될 때만 처리
		if (event.getTypeCode() == NotificationTypeCode.EXPIRY_DATE && event.getIsEnabled()) {
			// 해당 사용자의 유효기간 알림 서비스 호출
			gifticonExpiryNotificationAppService.sendExpiryDateNotificationForUser(event.getUserId());
		}
	}
}
