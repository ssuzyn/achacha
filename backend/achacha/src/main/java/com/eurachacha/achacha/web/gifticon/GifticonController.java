package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.GifticonGiveAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonGiveAwayRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonPresentRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonPresentResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/gifticons")
@RestController
@RequiredArgsConstructor
public class GifticonController {

	private final GifticonAppService gifticonAppService;
	private final GifticonGiveAppService gifticonGiveAppService;

	@PostMapping(value = "/image-metadata", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<GifticonMetadataResponseDto> extractGifticonMetadata(
		@RequestParam("image") MultipartFile image,
		@RequestParam("gifticonType") GifticonType gifticonType) {

		GifticonMetadataResponseDto result = gifticonAppService.extractGifticonMetadata(image, gifticonType);

		return ResponseEntity.ok(result);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> saveGifticon(
		@Valid @RequestPart("gifticon") GifticonSaveRequestDto gifticonSaveRequestDto,
		@RequestPart("originalImage") MultipartFile originalImage,
		@RequestPart("thumbnailImage") MultipartFile thumbnailImage,
		@RequestPart("barcodeImage") MultipartFile barcodeImage) {

		gifticonAppService.saveGifticon(gifticonSaveRequestDto, originalImage, thumbnailImage, barcodeImage);
		return ResponseEntity.ok("기프티콘이 성공적으로 등록되었습니다.");
	}

	@DeleteMapping("/{gifticonId}")
	public ResponseEntity<String> deleteGifticon(@PathVariable Integer gifticonId) {
		gifticonAppService.deleteGifticon(gifticonId);
		return ResponseEntity.ok("기프티콘이 성공적으로 삭제되었습니다.");
	}

	@PostMapping("/{gifticonId}/give-away")
	public ResponseEntity<String> giveAwayGifticon(@PathVariable Integer gifticonId,
		@RequestBody GifticonGiveAwayRequestDto uuids) {
		gifticonGiveAppService.giveAwayGifticon(gifticonId, uuids.getUuids());
		return ResponseEntity.ok("기프티콘을 뿌리기 하였습니다.");
	}

	@PostMapping("/{gifticonId}/present")
	public ResponseEntity<GifticonPresentResponseDto> presentGifticon(@PathVariable Integer gifticonId,
		@RequestBody GifticonPresentRequestDto gifticonPresentRequestDto) {

		GifticonPresentResponseDto result = gifticonGiveAppService.presentGifticon(gifticonId, gifticonPresentRequestDto);

		return ResponseEntity.ok(result);
	}
}
