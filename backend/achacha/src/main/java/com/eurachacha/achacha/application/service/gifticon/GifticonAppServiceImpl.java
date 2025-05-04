package com.eurachacha.achacha.application.service.gifticon;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GifticonAppServiceImpl implements GifticonAppService {

	private final GifticonDomainService gifticonDomainService;
	private final GifticonRepository gifticonRepository;
	private final OcrPort ocrPort;

	@Override
	public GifticonMetadataResponseDto extractGifticonMetadata(MultipartFile image, GifticonType gifticonType) {
		log.info("기프티콘 이미지 OCR 처리 시작 - 타입: {}", gifticonType.name());

		// 1. OCR 서비스를 통해 텍스트 추출
		String ocrResult = ocrPort.extractRawOcrResult(image);
		log.debug("OCR 결과 추출 완료");

		// 2. LangChain을 통해 OCR 결과에서 필요한 정보 추출
		// GifticonMetadataResponseDto metadata = langChainPort.extractMetadataFromOcrResult(
		// 	ocrResult, request.getGifticonType());
		// log.info("기프티콘 메타데이터 추출 완료: {}", metadata);

		// return metadata;
		return null;
	}

	@Override
	@Transactional
	public GifticonResponseDto saveGifticon(GifticonSaveRequestDto requestDto) {
		// 도메인 객체 생성
		Gifticon newGifticon = Gifticon.builder()
			.name(requestDto.getName())
			.barcode(requestDto.getBarcode())
			.type(requestDto.getType())
			.expireDate(requestDto.getExpireDate())
			.originalAmount(requestDto.getOriginalAmount())
			.remainingAmount(requestDto.getOriginalAmount())
			.sharebox(null)
			.brand(null)
			.build();

		// 도메인 서비스를 통한 유효성 검증
		gifticonDomainService.validateGifticon(newGifticon);

		// 저장소를 통한 영속화
		Gifticon savedGifticon = gifticonRepository.save(newGifticon);

		// 응답 DTO 반환
		return GifticonResponseDto.from(savedGifticon);
	}
}
