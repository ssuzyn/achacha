package com.eurachacha.achacha.application.service.fcm;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.fcm.GifticonExpiryNotificationAppService;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationEventPort;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GifticonExpiryNotificationAppServiceImpl implements GifticonExpiryNotificationAppService {

	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final ParticipationRepository participationRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final NotificationEventPort notificationEventPort;
	private final NotificationRepository notificationRepository;
	private final NotificationSettingDomainService notificationSettingDomainService;

	@Override
	@Transactional
	public void sendExpiryDateNotification() {

		LocalDate today = LocalDate.now();

		// 1, 2, 3, 7, 30, 60, 90일 남은 기프티콘 조회
		List<Gifticon> findGifticons = gifticonRepository.findGifticonsWithExpiryDates(getExpiryDates(today));

		if (findGifticons.isEmpty()) {
			return; // 해당하는 기프티콘이 없을 경우 종료
		}

		// 알림 타입 찾기
		NotificationType findCode = notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE);

		for (Gifticon findGifticon : findGifticons) {

			// 이미 공유된 기프티콘일 경우
			if (gifticonDomainService.isAlreadyShared(findGifticon)) {
				sharedGifticons(findGifticon, findCode, today);
				continue;
			}

			// 공유되지 않은 기프티콘일 경우
			unsharedGifticons(findGifticon, findCode, today);
		}
	}

	private void sharedGifticons(Gifticon findGifticon, NotificationType findCode, LocalDate today) {

		// 참여자 ID 목록 추출
		List<Integer> userIds = getUserIds(findGifticon);

		// 참여자 만료 알림 조회
		List<NotificationSetting> findSettings = notificationSettingRepository
			.findByUserIdInAndNotificationTypeId(userIds, findCode.getId());

		for (NotificationSetting findSetting : findSettings) {

			// 알림 전송
			saveAndSendNotification(findGifticon, findCode, today, findSetting);
		}
	}

	private void unsharedGifticons(Gifticon findGifticon, NotificationType findCode, LocalDate today) {

		// 사용자 알림 설정 조회
		NotificationSetting findSetting = notificationSettingRepository
			.findByUserIdAndNotificationTypeId(findGifticon.getUser().getId(), findCode.getId());

		// 알림 저장 및 전송
		saveAndSendNotification(findGifticon, findCode, today, findSetting);
	}

	private void saveAndSendNotification(Gifticon findGifticon, NotificationType findCode, LocalDate today,
		NotificationSetting findSetting) {
		// 알림 주기
		int day = findSetting.getExpirationCycle().getDays();

		List<LocalDate> expiryDates = getExpiryDates(today);

		boolean isExpiryMatch = expiryDates.stream()
			.anyMatch(expiryDate -> isExpiryMath(findGifticon, today, expiryDate, day));

		// 만료일 확인: 기프티콘의 만료일이 조회된 만료일 목록(1,2,3,7,30,60,90일 후)에 포함되고,
		// 알림 주기 확인: 만료일이 사용자의 알림 설정 주기보다 이른 경우에만 알림 발송
		if (isExpiryMatch) {
			String title = findCode.getCode().getDisplayName();
			String content = getContent(findGifticon, day);

			// 알림 저장
			saveNotification(findGifticon, findCode, findSetting, title, content);

			// 알림 설정 활성화 시 FCM 알림 전송
			if (notificationSettingDomainService.isEnabled(findSetting)) {
				// fcm token 조회
				List<FcmToken> findFcmTokens = fcmTokenRepository.findAllByUserId(findSetting.getUser().getId());

				findFcmTokens.forEach(fcmToken -> {
					NotificationEventDto dto = NotificationEventDto.builder()
						.fcmToken(fcmToken.getValue())
						.title(title)
						.body(content)
						.notificationTypeCode(findCode.getCode().name())
						.referenceEntityId(findGifticon.getId())
						.referenceEntityType("gifticon")
						.build();

					notificationEventPort.sendNotificationEvent(dto);
				});
			}
		}
	}

	private static boolean isExpiryMath(Gifticon findGifticon, LocalDate today, LocalDate expiryDate, int day) {
		return findGifticon.getExpiryDate().equals(expiryDate) && (
			findGifticon.getExpiryDate().isBefore(today.plusDays(day)) || findGifticon.getExpiryDate()
				.isEqual(today.plusDays(day)));
	}

	private static String getContent(Gifticon findGifticon, int day) {
		return findGifticon.getName() + "의 유효기간이 " + day + "일 남았습니다.";
	}

	private void saveNotification(Gifticon findGifticon, NotificationType findCode, NotificationSetting findSetting,
		String title, String content) {
		Notification notification = Notification.builder()
			.title(title)
			.content(content)
			.referenceEntityType("gifticon")
			.referenceEntityId(findGifticon.getId())
			.notificationType(findCode)
			.user(findSetting.getUser())
			.isRead(false)
			.build();

		// 알림 저장
		notificationRepository.save(notification);
	}

	private List<Integer> getUserIds(Gifticon findGifticon) {
		// 참여된 유저 리스트
		List<Participation> findParticipations = participationRepository
			.findByShareBoxId(findGifticon.getSharebox().getId());

		// 참여자 ID 목록 추출
		return findParticipations.stream()
			.map(p -> p.getUser().getId())
			.toList();
	}

	private List<LocalDate> getExpiryDates(LocalDate today) {
		return Arrays.stream(ExpirationCycle.values())
			.map(cycle -> today.plusDays(cycle.getDays()))
			.toList();
	}
}
