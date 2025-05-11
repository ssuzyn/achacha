package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

public interface NotificationSettingJpaRepository extends JpaRepository<NotificationSetting, Integer> {
	// 사용자 ID로 모든 알림 설정을 조회
	@Query("SELECT ns FROM NotificationSetting ns JOIN FETCH ns.notificationType WHERE ns.user.id = :userId")
	List<NotificationSetting> findAllByUserIdWithType(Integer userId);
}
