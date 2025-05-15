package com.eurachacha.achacha.application.port.output.history;

import java.util.List;

import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;

public interface GifticonOwnerHistoryRepository {
	GifticonOwnerHistory getGifticonOwnerHistoryDetail(Integer userId, Integer gifticonId);

	GifticonOwnerHistory save(GifticonOwnerHistory gifticonOwnerHistory);

	List<GifticonOwnerHistory> findLatestForEachGifticonByIdsAndFromUserId(List<Integer> ids,
		Integer fromUserId);
}
