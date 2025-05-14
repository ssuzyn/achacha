package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.sharebox.Participation;

@Repository
public interface ParticipationJpaRepository extends JpaRepository<Participation, Integer> {
	boolean existsByUserIdAndShareboxId(Integer userId, Integer shareBoxId);

	int countByShareboxId(Integer shareBoxId);

	@Query("""
		SELECT p FROM Participation p
		JOIN FETCH p.user
		WHERE p.sharebox.id = :shareBoxId
		""")
	List<Participation> findByShareboxId(@Param("shareBoxId") Integer shareBoxId);

	@Modifying
	@Query("""
		DELETE FROM Participation p
		WHERE p.user.id = :userId
		AND p.sharebox.id = :shareBoxId
		""")
	void deleteByUserIdAndShareboxId(@Param("userId") Integer userId, @Param("shareBoxId") Integer shareBoxId);

	@Modifying
	@Query("""
		DELETE FROM Participation p
		WHERE p.sharebox.id = :shareBoxId
		""")
	void deleteByShareboxId(@Param("shareBoxId") Integer shareBoxId);
}
