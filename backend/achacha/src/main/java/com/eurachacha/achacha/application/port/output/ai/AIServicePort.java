package com.eurachacha.achacha.application.port.output.ai;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;

public interface AIServicePort {
	GifticonMetadataResponseDto extractGifticonInfo(String ocrResult, String gifticonType);
}
