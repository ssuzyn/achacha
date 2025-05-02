package com.eurachacha.achacha.presentation.gifticon.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.gifticon.dto.request.GifticonSaveRequest;
import com.eurachacha.achacha.application.gifticon.service.GifticonAppService;
import com.eurachacha.achacha.domain.gifticon.entity.Gifticon;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/gifticons")
@RestController
@RequiredArgsConstructor
public class GifticonController {

	private final GifticonAppService gifticonAppService;

	@PostMapping
	public Gifticon saveGifticon(GifticonSaveRequest request) { // 임시용
		return gifticonAppService.saveGifticon(request);
	}
}
