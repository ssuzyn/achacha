package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.sharebox.Participation;

@Repository
public interface ParticipationJpaRepository extends JpaRepository<Participation, Integer> {
	boolean existsByUserIdAndShareboxId(Integer userId, Integer shareBoxId);

	int countByShareboxId(Integer shareBoxId);
}
