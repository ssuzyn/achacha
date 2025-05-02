package com.eurachacha.achacha.application.gifticon.service;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.application.gifticon.dto.request.GifticonSaveRequest;
import com.eurachacha.achacha.domain.gifticon.entity.Gifticon;
import com.eurachacha.achacha.domain.gifticon.service.GifticonService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GifticonAppServiceImpl implements GifticonAppService {

	private final GifticonService gifticonService;

	public Gifticon saveGifticon(GifticonSaveRequest request) { // 임시용
		Gifticon newGifticon = Gifticon.builder()
			.name(request.getName())
			.barcode(request.getBarcode())
			.type(request.getType())
			.expireDate(request.getExpireDate())
			.originalAmount(request.getOriginalAmount())
			.remainingAmount(request.getOriginalAmount())
			.sharebox(null)
			.brand(null)
			.build();

		return gifticonService.saveGifticon(newGifticon);
	}
}
