package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.domain.model.history.UsageHistory;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsageHistoryPersistenceAdapter implements UsageHistoryRepository {

	private final UsageHistoryJpaRepository usageHistoryJpaRepository;

	@Override
	public UsageHistory saveUsageHistory(UsageHistory usageHistory) {
		return usageHistoryJpaRepository.save(usageHistory);
	}

	@Override
	public UsageHistory getUsageHistoryDetail(Integer userId, Integer gifticonId) {
		return usageHistoryJpaRepository.findUsageHistoryDetailByUserIdAndGifticonId(userId, gifticonId);
	}

	@Override
	public List<UsageHistory> findUsageHistories(Integer gifticonId) {
		return usageHistoryJpaRepository.findAllByGifticonIdOrderByCreatedAtDesc(gifticonId);
	}
}
