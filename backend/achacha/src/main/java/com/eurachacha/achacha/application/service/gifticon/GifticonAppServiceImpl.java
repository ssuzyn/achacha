package com.eurachacha.achacha.application.service.gifticon;

import java.time.LocalDateTime;

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
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.application.port.output.ai.AIServicePort;
import com.eurachacha.achacha.application.port.output.ai.dto.response.GifticonMetadataDto;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.PageableFactory;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

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
	private final GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;
	private final UsageHistoryRepository usageHistoryRepository;

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

		// 기프티콘 조회 쿼리 실행
		Slice<AvailableGifticonResponseDto> gifticonSlice = gifticonRepository.findAvailableGifticons(userId,
			scope, type, pageable);

		return AvailableGifticonsResponseDto.builder()
			.gifticons(gifticonSlice.getContent())
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId) {

		Integer userId = 3; // 유저 로직 추가 시 변경 필요

		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 *  3. 유효기간 여부 판단
		 */
		gifticonDomainService.validateGifticonAvailability(userId, findGifticon);

		// 공유되지 않은 기프티콘인 경우 소유자 판단
		if (findGifticon.getSharebox() == null) {
			boolean isOwner = gifticonDomainService.validateGifticonAccess(userId, findGifticon.getUser().getId());
			if (!isOwner) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}
		}

		// 공유된 기프티콘인 경우 참여 여부 판단
		if (findGifticon.getSharebox() != null) {
			boolean hasParticipation = participationRepository.checkParticipation(userId,
				findGifticon.getSharebox().getId());

			if (!hasParticipation) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}
		}

		// 기프티콘 스코프 결정에 따른 값
		String scope = findGifticon.getSharebox() == null ? "MY_BOX" : "SHARE_BOX";
		Integer shareBoxId = findGifticon.getSharebox() == null ? null : findGifticon.getSharebox().getId();
		String shareBoxName = findGifticon.getSharebox() == null ? null : findGifticon.getSharebox().getName();

		return AvailableGifticonDetailResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonType(findGifticon.getType())
			.gifticonExpiryDate(findGifticon.getExpiryDate())
			.brandId(findGifticon.getBrand().getId())
			.brandName(findGifticon.getBrand().getName())
			.scope(scope)
			.userId(findGifticon.getUser().getId())
			.userName(findGifticon.getUser().getName())
			.shareBoxId(shareBoxId)
			.shareBoxName(shareBoxName)
			.thumbnailPath(null) // 파일로직 구현 후 수정
			.originalImagePath(null) // 파일로직 구현 후 수정
			.gifticonCreatedAt(findGifticon.getCreatedAt())
			.gifticonOriginalAmount(findGifticon.getOriginalAmount())
			.gifticonRemainingAmount(findGifticon.getRemainingAmount())
			.build();
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

	@Override
	public UsedGifticonDetailResponseDto getUsedGifticonDetail(Integer gifticonId) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 삭제 여부 검토
		boolean deleted = gifticonDomainService.isDeleted(findGifticon);
		if (deleted) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		GifticonOwnerHistory findOHistory = gifticonOwnerHistoryRepository.getGifticonOwnerHistoryDetail(
			userId, findGifticon.getId());
		UsageHistory findUHistory = usageHistoryRepository.getUsageHistoryDetail(userId, findGifticon.getId());

		// 사용 타입
		UsageType usageType = UsageType.SELF_USE;

		// 사용 시간
		LocalDateTime usedAt = null;

		// 둘 다 없을 경우 사용하지 않은 기프티콘으로 간주
		if (findOHistory == null && findUHistory == null) {
			throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
		}

		// 타인에게 넘겨준 경우
		if (findOHistory != null) {
			// 송신자 검토
			boolean isSendUser = gifticonDomainService.validateGifticonAccess(userId,
				findOHistory.getFromUser().getId());
			if (!isSendUser) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}

			usageType =
				findOHistory.getTransferType() == TransferType.GIVE_AWAY ? UsageType.GIVE_AWAY : UsageType.PRESENT;
			usedAt = findOHistory.getCreatedAt();
		}

		// 본인이 사용한 경우
		if (findUHistory != null) {
			// 사용자 검토
			boolean isUsedUser = gifticonDomainService.validateGifticonAccess(userId, findUHistory.getUser().getId());
			if (!isUsedUser) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}

			// 사용 여부 검토 (금액권 기준)
			boolean used = gifticonDomainService.isUsed(findGifticon);
			if (!used) {
				throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
			}

			usedAt = findUHistory.getCreatedAt();
		}

		Integer amount = findGifticon.getType() == GifticonType.AMOUNT ? findGifticon.getOriginalAmount() : null;

		return UsedGifticonDetailResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonType(findGifticon.getType())
			.gifticonExpiryDate(findGifticon.getExpiryDate())
			.brandId(findGifticon.getBrand().getId())
			.brandName(findGifticon.getBrand().getName())
			.usageType(usageType)
			.usageHistoryCreatedAt(usedAt)
			.thumbnailPath(null)
			.originalImagePath(null)
			.gifticonOriginalAmount(amount)
			.gifticonCreatedAt(findGifticon.getCreatedAt())
			.build();
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
