package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.history.UsageHistory;

@Repository
public interface UsageHistoryJpaRepository extends JpaRepository<UsageHistory, Integer> {
	@Query("""
		SELECT uh
		FROM UsageHistory uh
		WHERE uh.user.id = :userId
		AND uh.gifticon.id = :gifticonId
		ORDER BY uh.createdAt DESC
		LIMIT 1
		""")
	UsageHistory findLatestByUserIdAndGifticonId(
		@Param("userId") Integer userId,
		@Param("gifticonId") Integer gifticonId);

	List<UsageHistory> findAllByGifticonIdOrderByCreatedAtDesc(Integer gifticonId);

	Optional<UsageHistory> findByIdAndGifticonIdAndUserId(Integer usageHistoryId, Integer gifticonId, Integer userId);

	@Query("""
		SELECT uh
		FROM UsageHistory uh
		WHERE (uh.gifticon.id, uh.createdAt) IN (
		    SELECT uh2.gifticon.id, MAX(uh2.createdAt)
		    FROM UsageHistory uh2
		    WHERE uh2.gifticon.id IN :ids
		    AND uh2.user.id = :userId
		    GROUP BY uh2.gifticon.id)
		""")
	List<UsageHistory> findLatestForEachGifticonByIdsAndUserId(
		@Param("ids") List<Integer> ids,
		@Param("userId") Integer userId);
}
