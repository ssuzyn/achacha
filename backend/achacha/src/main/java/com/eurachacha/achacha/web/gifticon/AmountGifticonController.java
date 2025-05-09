package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonUsageAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/amount-gifticons")
@RestController
@RequiredArgsConstructor
public class AmountGifticonController {

	private final GifticonUsageAppService gifticonUsageAppService;

	@PostMapping("/{gifticonId}/use")
	public ResponseEntity<String> useGifticon(
		@PathVariable Integer gifticonId,
		@RequestBody AmountGifticonUseRequestDto requestDto
	) {
		return ResponseEntity.ok(gifticonUsageAppService.useAmountGifticon(gifticonId, requestDto));
	}
}
