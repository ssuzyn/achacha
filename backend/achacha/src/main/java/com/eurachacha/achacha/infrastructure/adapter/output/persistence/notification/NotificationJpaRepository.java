package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.notification.Notification;

@Repository
public interface NotificationJpaRepository extends JpaRepository<Notification, Integer>, NotificationRepositoryCustom {
}
