package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eurachacha.achacha.domain.model.notification.NotificationType;

public interface NotificationTypeJpaRepository extends JpaRepository<NotificationType, Integer> {
}
