package com.eurachacha.achacha.application.service.gifticon;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonResponseDto;
import com.eurachacha.achacha.application.port.output.ai.AIServicePort;
import com.eurachacha.achacha.application.port.output.ai.dto.response.GifticonMetadataDto;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.PageableFactory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GifticonAppServiceImpl implements GifticonAppService {

	private final GifticonDomainService gifticonDomainService;
	private final GifticonRepository gifticonRepository;
	private final ParticipationRepository participationRepository;
	private final PageableFactory pageableFactory;
	private final OcrPort ocrPort;
	private final AIServicePort aiServicePort;
	private final BrandRepository brandRepository;

	@Override
	public GifticonMetadataResponseDto extractGifticonMetadata(MultipartFile image, GifticonType gifticonType) {
		log.info("기프티콘 이미지 OCR 처리 시작 - 타입: {}", gifticonType.name());

		// 1. OCR 서비스를 통해 텍스트 추출
		String ocrResult = ocrPort.extractRawOcrResult(image);
		log.debug("OCR 결과 추출 완료");

		// 2. AI 서비스를 통해 OCR 결과에서 필요한 정보 추출
		GifticonMetadataDto metadata = aiServicePort.extractGifticonInfo(
			ocrResult, gifticonType.name());
		log.info("기프티콘 메타데이터 추출 완료: {}", metadata);

		// 브랜드 ID 조회
		Integer brandId = findBrandId(metadata.getBrandName());

		// 브랜드명 설정
		String brandName = brandId != null ? metadata.getBrandName() : null;

		// 3. MongoDB에 OCR 결과 넣는 과정 필요, (saveGifticon에서 사용자가 수정한 값을 학습 데이터도 이후에 넣어야 함 사용)

		// 최종 응답용 DTO 생성 및 반환
		return GifticonMetadataResponseDto.builder()
			.gifticonName(metadata.getGifticonName())
			.brandName(brandName)
			.brandId(brandId)
			.gifticonBarcodeNumber(metadata.getGifticonBarcodeNumber())
			.gifticonExpiryDate(metadata.getGifticonExpiryDate())
			.gifticonOriginalAmount(metadata.getGifticonOriginalAmount())
			.build();
	}

	@Transactional
	@Override
	public GifticonResponseDto saveGifticon(GifticonSaveRequestDto requestDto) {
		// 도메인 객체 생성
		Gifticon newGifticon = Gifticon.builder()
			.name(requestDto.getName())
			.barcode(requestDto.getBarcode())
			.type(requestDto.getType())
			.expiryDate(requestDto.getExpiryDate())
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

	@Override
	public AvailableGifticonsResponseDto getAvailableGifticons(GifticonScopeType scope, GifticonType type,
		GifticonSortType sort, Integer page, Integer size) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 쿼리 실행
		Slice<AvailableGifticonResponseDto> gifticonSlice = gifticonRepository.getAvailableGifticons(userId,
			scope, type, pageable);

		return AvailableGifticonsResponseDto.builder()
			.gifticons(gifticonSlice.getContent())
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId) {

		Integer userId = 2; // 유저 로직 추가 시 변경 필요

		AvailableGifticonDetailResponseDto detailResponseDto = gifticonRepository.getAvailableGifticonDetail(
			gifticonId);

		System.out.println(detailResponseDto.getShareBoxId());
		if (detailResponseDto.getShareBoxId() == null) { // 공유되지 않은 기프티콘인 경우
			gifticonDomainService.validateGifticonAccess(userId, detailResponseDto.getUserId());
		}

		if (detailResponseDto.getShareBoxId() != null) { // 공유된 기프티콘인 경우
			participationRepository.checkParticipation(userId, detailResponseDto.getShareBoxId());
		}

		return detailResponseDto;
	}

	private Integer findBrandId(String brandName) {
		if (brandName == null || brandName.trim().isEmpty()) {
			return null;
		}

		return brandRepository.findByNameEquals(brandName)
			.map(Brand::getId)
			.orElse(null);
	}
}
