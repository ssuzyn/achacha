package com.eurachacha.achacha.application.port.input.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonUsageHistoriesResponseDto;

public interface GifticonUsageAppService {
	void useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto);

	GifticonUsageHistoriesResponseDto getGifticonUsageHistorys(Integer gifticonId);

	void updateGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId, AmountGifticonUseRequestDto requestDto);

	void deleteGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId);
}
