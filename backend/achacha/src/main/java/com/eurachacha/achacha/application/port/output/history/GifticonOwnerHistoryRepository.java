package com.eurachacha.achacha.application.port.output.history;

import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;

public interface GifticonOwnerHistoryRepository {
	GifticonOwnerHistory getGifticonOwnerHistoryDetail(Integer userId, Integer gifticonId);
}
