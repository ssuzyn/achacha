package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/gifticons")
@RestController
@RequiredArgsConstructor
public class GifticonController {

	private final GifticonAppService gifticonAppService;

	@PostMapping(value = "/image-metadata", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<GifticonMetadataResponseDto> extractGifticonMetadata(
		@RequestParam("image") MultipartFile image,
		@RequestParam("gifticonType") GifticonType gifticonType) {

		GifticonMetadataResponseDto result = gifticonAppService.extractGifticonMetadata(image, gifticonType);

		return ResponseEntity.ok(result);
	}

	@PostMapping
	public ResponseEntity<GifticonResponseDto> saveGifticon(@RequestBody GifticonSaveRequestDto requestDto) {
		GifticonResponseDto responseDto = gifticonAppService.saveGifticon(requestDto);
		return ResponseEntity.ok(responseDto);
	}

}
