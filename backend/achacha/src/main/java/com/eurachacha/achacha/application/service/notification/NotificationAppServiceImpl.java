package com.eurachacha.achacha.application.service.notification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.notification.NotificationAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationCountResponseDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationResponseDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationsResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationSortType;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.PageableFactory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationAppServiceImpl implements NotificationAppService {

	private final NotificationRepository notificationRepository;
	private final PageableFactory pageableFactory;
	private final SecurityServicePort securityServicePort;

	@Override
	public NotificationsResponseDto getNotifications(NotificationSortType sort, Integer page, Integer size) {
		log.info("알림 목록 조회 시작");

		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 알림 목록 조회
		Slice<Notification> notificationSlice = notificationRepository.findNotifications(userId, pageable);

		// 알림이 없는 경우 빈 응답 반환
		if (notificationSlice.isEmpty()) {
			return NotificationsResponseDto.builder()
				.notifications(List.of())
				.hasNextPage(false)
				.nextPage(null)
				.build();
		}

		List<NotificationResponseDto> notificationResponseDtos = notificationSlice.getContent().stream()
			.map(notification -> NotificationResponseDto.builder()
				.notificationId(notification.getId())
				.notificationTitle(notification.getTitle())
				.notificationContent(notification.getContent())
				.notificationCreatedAt(notification.getCreatedAt())
				.notificationIsRead(notification.getIsRead())
				.notificationType(notification.getNotificationType().getCode())
				.referenceEntityType(notification.getReferenceEntityType())
				.referenceEntityId(notification.getReferenceEntityId())
				.build())
			.collect(Collectors.toList());

		return NotificationsResponseDto.builder()
			.notifications(notificationResponseDtos)
			.hasNextPage(notificationSlice.hasNext())
			.nextPage(notificationSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public NotificationCountResponseDto countUnreadNotifications(boolean read) {
		User user = securityServicePort.getLoggedInUser();
		int count = notificationRepository.countByUserIdAndRead(user.getId(), read);
		return NotificationCountResponseDto.builder()
			.count(count)
			.build();
	}

	@Override
	@Transactional
	public void markAllNotificationsAsRead() {
		User user = securityServicePort.getLoggedInUser();
		notificationRepository.updateAllNotificationsToRead(user.getId());
	}
}
