package com.eurachacha.achacha.infrastructure.adapter.output.persistence.fcm;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.fcm.FcmToken;

@Repository
public interface FcmTokenJpaRepository extends JpaRepository<FcmToken, Integer> {

	List<FcmToken> findAllByUser_Id(Integer userId);
}
