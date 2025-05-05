package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.sharebox.Participation;

@Repository
public interface ParticipationJpaRepository extends JpaRepository<Participation, Integer> {
	@Query("SELECT p FROM Participation p WHERE p.user.id = :userId AND p.sharebox.id = :shareBoxId")
	Optional<Participation> checkParticipation(Integer userId, Integer shareBoxId);

}
