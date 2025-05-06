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
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
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

		if (detailResponseDto.getShareBoxId() == null) { // 공유되지 않은 기프티콘인 경우
			gifticonDomainService.validateGifticonAccess(userId, detailResponseDto.getUserId());
		}

		if (detailResponseDto.getShareBoxId() != null) { // 공유된 기프티콘인 경우
			participationRepository.checkParticipation(userId, detailResponseDto.getShareBoxId());
		}

		return detailResponseDto;
	}

	@Override
	public UsedGifticonsResponseDto getUsedGifticons(GifticonType type, GifticonUsedSortType sort, Integer page,
		Integer size) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 쿼리 실행
		Slice<UsedGifticonResponseDto> gifticonSlice =
			gifticonRepository.getUsedGifticons(userId, type, pageable);

		return UsedGifticonsResponseDto.builder()
			.gifticons(gifticonSlice.getContent())
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}
}
