package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonResponseDto;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/gifticons")
@RestController
@RequiredArgsConstructor
public class GifticonController {

	private final GifticonAppService gifticonAppService;

	@PostMapping
	public ResponseEntity<GifticonResponseDto> saveGifticon(@RequestBody GifticonSaveRequestDto requestDto) {
		GifticonResponseDto responseDto = gifticonAppService.saveGifticon(requestDto);
		return ResponseEntity.ok(responseDto);
	}
}
