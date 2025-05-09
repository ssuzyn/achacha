package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonUsageHistoryResponseDto;
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
	UsageHistory findUsageHistoryDetailByUserIdAndGifticonId(
		@Param("userId") Integer userId,
		@Param("gifticonId") Integer gifticonId);

	@Query("""
		SELECT new com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonUsageHistoryResponseDto(
			uh.id, uh.usageAmount, uh.createdAt, uh.user.id, uh.user.name)
		FROM UsageHistory uh
		WHERE uh.gifticon.id = :gifticonId
		ORDER BY uh.createdAt DESC
		""")
	List<GifticonUsageHistoryResponseDto> findUsageHistories(
		@Param("userId") Integer userId,
		@Param("gifticonId") Integer gifticonId);
}
