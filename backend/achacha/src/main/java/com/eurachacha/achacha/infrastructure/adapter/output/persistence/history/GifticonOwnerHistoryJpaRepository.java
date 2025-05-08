package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;

@Repository
public interface GifticonOwnerHistoryJpaRepository extends JpaRepository<GifticonOwnerHistory, Integer> {
	@Query("""
		SELECT oh
		FROM GifticonOwnerHistory oh
		WHERE oh.fromUser.id = :userId
			AND oh.gifticon.id = :gifticonId
		ORDER BY oh.createdAt DESC
		LIMIT 1
		""")
	GifticonOwnerHistory findOwnerHistoryDetailByUserIdAndGifticonId(
		@Param("userId") Integer userId,
		@Param("gifticonId") Integer gifticonId);
}
