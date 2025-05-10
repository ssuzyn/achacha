package com.eurachacha.achacha.application.port.input.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AmountGifticonUsageHistoriesResponseDto;

public interface GifticonUsageAppService {
	void useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto);

	AmountGifticonUsageHistoriesResponseDto getAmountGifticonUsageHistorys(Integer gifticonId);

	void updateGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId, AmountGifticonUseRequestDto requestDto);

	void deleteGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId);

	void useProductGifticon(Integer gifticonId);
}
