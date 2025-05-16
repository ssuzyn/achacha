package com.eurachacha.achacha.application.service.gifticon;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonBarcodeResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.application.port.output.ai.AIServicePort;
import com.eurachacha.achacha.application.port.output.ai.OcrTrainingDataRepository;
import com.eurachacha.achacha.application.port.output.ai.dto.response.GifticonMetadataDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.BarcodeHistoryRepository;
import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.domain.model.ai.OcrTrainingData;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
import com.eurachacha.achacha.domain.model.history.BarcodeHistory;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.file.FileDomainService;
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
	private final BarcodeHistoryRepository barcodeHistoryRepository;
	private final OcrTrainingDataRepository ocrTrainingDataRepository;
	private final FileStoragePort fileStoragePort;
	private final FileRepository fileRepository;
	private final FileDomainService fileDomainService;
	private final ShareBoxRepository shareBoxRepository;
	private final SecurityServicePort securityServicePort;

	@Override
	public GifticonMetadataResponseDto extractGifticonMetadata(MultipartFile image, GifticonType gifticonType) {
		log.info("기프티콘 이미지 OCR 처리 시작 - 타입: {}", gifticonType.name());

		// 이미지 파일 검증
		fileDomainService.validateImageFile(image);

		// 1. OCR 서비스를 통해 텍스트 추출
		String ocrResult = ocrPort.extractRawOcrResult(image);
		log.debug("OCR 결과 추출 완료");

		// 2. AI 서비스를 통해 OCR 결과에서 필요한 정보 추출
		GifticonMetadataDto metadata = aiServicePort.extractGifticonInfo(
			ocrResult, gifticonType.name());
		log.info("기프티콘 메타데이터 추출 완료: {}", metadata);

		// OCR 결과와 AI 추출 메타데이터를 한 번에 저장
		OcrTrainingData savedTrainingData = ocrTrainingDataRepository.saveOcrResultWithMetadata(
			ocrResult,
			gifticonType.name(),
			metadata.getGifticonBarcodeNumber(),
			metadata.getBrandName(),
			metadata.getGifticonName(),
			metadata.getGifticonExpiryDate(),
			metadata.getGifticonOriginalAmount()
		);

		// 브랜드 ID 조회
		Integer brandId = findBrandId(metadata.getBrandName());

		// 브랜드명 설정
		String brandName = brandId != null ? metadata.getBrandName() : null;

		log.info("OCR 및 AI 추출 메타데이터 저장 완료 (ID: {})", savedTrainingData.getId());

		// 최종 응답용 DTO에 OCR 학습 데이터 ID 추가하여 반환
		return GifticonMetadataResponseDto.builder()
			.gifticonName(metadata.getGifticonName())
			.brandName(brandName)
			.brandId(brandId)
			.gifticonBarcodeNumber(metadata.getGifticonBarcodeNumber())
			.gifticonExpiryDate(metadata.getGifticonExpiryDate())
			.gifticonOriginalAmount(metadata.getGifticonOriginalAmount())
			.ocrTrainingDataId(savedTrainingData.getId())
			.build();
	}

	@Transactional
	@Override
	public void saveGifticon(GifticonSaveRequestDto requestDto, MultipartFile originalImage,
		MultipartFile thumbnailImage, MultipartFile barcodeImage) {
		log.info("기프티콘 저장 시작 - 이름: {}, 타입: {}", requestDto.getGifticonName(), requestDto.getGifticonType());

		// 이미지 파일 검증
		fileDomainService.validateImageFile(originalImage);
		fileDomainService.validateImageFile(thumbnailImage);
		fileDomainService.validateImageFile(barcodeImage);
		gifticonDomainService.validateGifticonAmount(requestDto.getGifticonType(), requestDto.getGifticonAmount());

		// 기프티콘 유효기간 검증
		gifticonDomainService.validateGifticonExpiryDate(requestDto.getGifticonExpiryDate(), LocalDate.now());
		// 바코드 중복 검사
		if (gifticonRepository.existsByBarcode(requestDto.getGifticonBarcodeNumber())) {
			throw new CustomException(ErrorCode.GIFTICON_BARCODE_DUPLICATE);
		}

		// 타입에 따른 금액 처리
		Integer amount = null;
		if (requestDto.getGifticonType() == GifticonType.AMOUNT) {
			amount = requestDto.getGifticonAmount();
		}

		// Brand 객체 조회
		Brand brand = brandRepository.findById(requestDto.getBrandId());

		// ShareBox 객체 조회, Participants 조회로 참여하고 있는 기프티콘 박스인지 체크해야 함.
		ShareBox shareBox = null;
		if (requestDto.getShareBoxId() != null) {
			shareBox = shareBoxRepository.findById(requestDto.getShareBoxId());

			// 현재 사용자가 해당 공유 박스에 참여 중인지 확인
			Integer userId = 1; // 인증 구현 시 변경 필요
			boolean hasParticipation = participationRepository.checkParticipation(userId, shareBox.getId());

			if (!hasParticipation) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}
		}

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();

		// 도메인 객체 생성
		Gifticon newGifticon = Gifticon.builder()
			.name(requestDto.getGifticonName())
			.barcode(requestDto.getGifticonBarcodeNumber())
			.type(requestDto.getGifticonType())
			.expiryDate(requestDto.getGifticonExpiryDate())
			.originalAmount(requestDto.getGifticonAmount())
			.remainingAmount(requestDto.getGifticonAmount())
			.sharebox(shareBox)
			.brand(brand)
			.user(loggedInUser)
			.build();

		// 저장소를 통한 영속화
		Gifticon savedGifticon = gifticonRepository.save(newGifticon);

		// 파일 업로드
		String originalImagePath = fileStoragePort.uploadFile(originalImage, FileType.ORIGINAL, savedGifticon.getId());
		String thumbnailImagePath = fileStoragePort.uploadFile(thumbnailImage, FileType.THUMBNAIL,
			savedGifticon.getId());
		String barcodeImagePath = fileStoragePort.uploadFile(barcodeImage, FileType.BARCODE, savedGifticon.getId());

		// 파일 엔티티 생성 및 저장
		saveGifticonFiles(savedGifticon.getId(), originalImagePath, thumbnailImagePath, barcodeImagePath);

		// 사용자 수정 메타데이터 저장 - 타입에 따라 다른 메서드 호출
		if (requestDto.getGifticonType() == GifticonType.AMOUNT) {
			// 금액형 기프티콘인 경우
			ocrTrainingDataRepository.updateUserCorrectedForAmount(
				requestDto.getOcrTrainingDataId(),
				requestDto.getGifticonBarcodeNumber(),
				brand.getName(),
				requestDto.getGifticonName(),
				requestDto.getGifticonExpiryDate().toString(),
				amount
			);
		} else {
			// 상품형 기프티콘인 경우
			ocrTrainingDataRepository.updateUserCorrectedForProduct(
				requestDto.getOcrTrainingDataId(),
				requestDto.getGifticonBarcodeNumber(),
				brand.getName(),
				requestDto.getGifticonName(),
				requestDto.getGifticonExpiryDate().toString()
			);
		}

		log.info("사용자 수정 메타데이터 저장 완료 (ID: {})", requestDto.getOcrTrainingDataId());
	}

	@Override
	public AvailableGifticonsResponseDto getAvailableGifticons(GifticonScopeType scope, GifticonType type,
		GifticonSortType sort, Integer page, Integer size) {

		log.info("사용가능 기프티콘 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 기프티콘 조회 쿼리 실행
		Slice<Gifticon> gifticonSlice = gifticonRepository.findAvailableGifticons(userId, scope, type, pageable);

		// entity -> dto 변환
		List<AvailableGifticonResponseDto> availableGifticonResponseDtos = getAvailableGifticonResponseDto(
			gifticonSlice);

		log.info("사용가능 기프티콘 조회 완료");

		return AvailableGifticonsResponseDto.builder()
			.gifticons(availableGifticonResponseDtos)
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId) {

		log.info("사용가능 기프티콘 상세 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 */
		gifticonDomainService.validateGifticonIsAvailable(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 기프티콘 스코프 결정에 따른 값
		String scope = findGifticon.getSharebox() == null ? "MY_BOX" : "SHARE_BOX";
		Integer shareBoxId = findGifticon.getSharebox() == null ? null : findGifticon.getSharebox().getId();
		String shareBoxName = findGifticon.getSharebox() == null ? null : findGifticon.getSharebox().getName();

		log.info("사용가능 기프티콘 상세 조회 완료");

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
			.thumbnailPath(getGifticonImageUrl(gifticonId, FileType.THUMBNAIL)) // 파일로직 구현 후 수정
			.originalImagePath(getGifticonImageUrl(gifticonId, FileType.ORIGINAL)) // 파일로직 구현 후 수정
			.gifticonCreatedAt(findGifticon.getCreatedAt())
			.gifticonOriginalAmount(findGifticon.getOriginalAmount())
			.gifticonRemainingAmount(findGifticon.getRemainingAmount())
			.build();
	}

	@Override
	public UsedGifticonsResponseDto getUsedGifticons(GifticonType type, GifticonUsedSortType sort, Integer page,
		Integer size) {

		log.info("사용완료 기프티콘 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 쿼리 실행
		Slice<Gifticon> gifticonSlice = gifticonRepository.getUsedGifticons(userId, type, pageable);

		List<UsedGifticonResponseDto> usedGifticonResponseDtos = getUsedGifticonResponseDtos(userId, gifticonSlice);

		log.info("사용완료 기프티콘 조회 완료");

		return UsedGifticonsResponseDto.builder()
			.gifticons(usedGifticonResponseDtos)
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public UsedGifticonDetailResponseDto getUsedGifticonDetail(Integer gifticonId) {

		log.info("사용완료 기프티콘 상세 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 삭제 여부 검토
		boolean deleted = gifticonDomainService.isDeleted(findGifticon);
		if (deleted) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		GifticonOwnerHistory findOwnerHistory = gifticonOwnerHistoryRepository.getGifticonOwnerHistoryDetail(
			userId, findGifticon.getId());
		UsageHistory findUsageHistory = usageHistoryRepository.findLatestByUserIdAndGifticonId(userId,
			findGifticon.getId());

		// 둘 다 없을 경우 사용하지 않은 기프티콘으로 간주
		if (findOwnerHistory == null && findUsageHistory == null) {
			throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
		}

		UsageType usageType = UsageType.SELF_USE; // 사용 타입
		LocalDateTime usedAt = null; // 사용 시간
		String thumbnailPath = null; // 썸네일 파일 경로
		String originalImagePath = null; // 원본 이미지 파일 경로

		// 타인에게 넘겨준 경우
		if (findOwnerHistory != null) {
			// 송신자 검토
			boolean isSendUser = gifticonDomainService.hasAccess(userId,
				findOwnerHistory.getFromUser().getId());
			if (!isSendUser) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}

			usageType =
				findOwnerHistory.getTransferType() == TransferType.GIVE_AWAY ? UsageType.GIVE_AWAY : UsageType.PRESENT;
			usedAt = findOwnerHistory.getCreatedAt();
			thumbnailPath = getGifticonImageUrl(findGifticon.getId(), FileType.THUMBNAIL);
		}

		// 본인이 사용한 경우
		if (findUsageHistory != null) {
			// 사용자 검토
			boolean isUsedUser = gifticonDomainService.hasAccess(userId,
				findUsageHistory.getUser().getId());
			if (!isUsedUser) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}

			// 사용 여부 검토 (금액권 기준)
			boolean used = gifticonDomainService.isUsed(findGifticon);
			if (!used) {
				throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
			}

			usedAt = findUsageHistory.getCreatedAt();
			thumbnailPath = getGifticonImageUrl(findGifticon.getId(), FileType.THUMBNAIL);
			originalImagePath = getGifticonImageUrl(findGifticon.getId(), FileType.ORIGINAL);
		}

		Integer amount = findGifticon.getType() == GifticonType.AMOUNT ? findGifticon.getOriginalAmount() : null;

		log.info("사용완료 기프티콘 상세 조회 완료");

		return UsedGifticonDetailResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonType(findGifticon.getType())
			.gifticonExpiryDate(findGifticon.getExpiryDate())
			.brandId(findGifticon.getBrand().getId())
			.brandName(findGifticon.getBrand().getName())
			.usageType(usageType)
			.usageHistoryCreatedAt(usedAt)
			.thumbnailPath(thumbnailPath)
			.originalImagePath(originalImagePath)
			.gifticonOriginalAmount(amount)
			.gifticonCreatedAt(findGifticon.getCreatedAt())
			.build();
	}

	@Override
	@Transactional
	public GifticonBarcodeResponseDto getAvailableGifticonBarcode(Integer gifticonId) {

		log.info("사용가능 기프티콘 바코드 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 */
		gifticonDomainService.validateGifticonIsAvailable(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 바코드 조회 내역 생성
		BarcodeHistory newBarcodeHistory = BarcodeHistory.builder()
			.user(loggedInUser) // 유저 로직 추가 시 변경 필요
			.gifticon(findGifticon)
			.build();

		// 바코드 조회 내역 저장
		barcodeHistoryRepository.saveBarcodeHistory(newBarcodeHistory);

		log.info("사용가능 기프티콘 바코드 조회 종료");

		return GifticonBarcodeResponseDto.builder()
			.gifticonBarcodeNumber(findGifticon.getBarcode())
			.barcodePath(getGifticonImageUrl(findGifticon.getId(), FileType.BARCODE))
			.build();
	}

	@Override
	public GifticonBarcodeResponseDto getUsedGifticonBarcode(Integer gifticonId) {

		log.info("사용완료 기프티콘 바코드 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 삭제, 사용되었는지 검증
		gifticonDomainService.validateGifticonIsUsed(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 해당 기프티콘에 대한 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findLatestByUserIdAndGifticonId(userId,
			findGifticon.getId());
		if (findUsageHistory == null) {
			throw new CustomException(ErrorCode.GIFTICON_NO_USAGE_HISTORY);
		}

		log.info("사용완료 기프티콘 바코드 조회 종료");

		return GifticonBarcodeResponseDto.builder()
			.gifticonBarcodeNumber(findGifticon.getBarcode())
			.barcodePath(getGifticonImageUrl(findGifticon.getId(), FileType.BARCODE))
			.build();
	}

	@Override
	@Transactional
	public void deleteGifticon(Integer gifticonId) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 소유자, 기프티콘 공유, 삭제여부 검증
		gifticonDomainService.validateGifticonForDelete(userId, findGifticon);

		// 바코드 정보 삭제
		findGifticon.deleteBarcode();

		// 논리 삭제
		findGifticon.delete();
	}

	private Integer findBrandId(String brandName) {
		if (brandName == null || brandName.trim().isEmpty()) {
			return null;
		}

		return brandRepository.findByNameEquals(brandName)
			.map(Brand::getId)
			.orElse(null);
	}

	private void saveGifticonFiles(Integer gifticonId, String originalImagePath,
		String thumbnailImagePath, String barcodeImagePath) {
		// File 엔티티 생성
		File originalImageFile = File.builder()
			.path(originalImagePath)
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.type(FileType.ORIGINAL)
			.build();

		File thumbnailImageFile = File.builder()
			.path(thumbnailImagePath)
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.type(FileType.THUMBNAIL)
			.build();

		File barcodeImageFile = File.builder()
			.path(barcodeImagePath)
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.type(FileType.BARCODE)
			.build();

		// 파일 저장
		fileRepository.save(originalImageFile);
		fileRepository.save(thumbnailImageFile);
		fileRepository.save(barcodeImageFile);

		log.info("기프티콘 이미지 파일 저장 완료 (기프티콘 ID: {})", gifticonId);
	}

	private String getGifticonImageUrl(Integer gifticonId, FileType fileType) {
		File file = fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType("gifticon", gifticonId,
				fileType)
			.orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND));

		return fileStoragePort.generateFileUrl(file.getPath(), fileType);
	}

	private String getSignedUrl(String filePath, FileType fileType) {
		return fileStoragePort.generateFileUrl(filePath, fileType);
	}

	private void validateGifticonAccess(Gifticon findGifticon, Integer userId) {
		// 공유되지 않은 기프티콘인 경우 소유자 판단
		if (findGifticon.getSharebox() == null) {
			boolean isOwner = gifticonDomainService.hasAccess(userId, findGifticon.getUser().getId());
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
	}

	private List<AvailableGifticonResponseDto> getAvailableGifticonResponseDto(
		Slice<Gifticon> gifticons) {

		// 기프티콘 id 추출
		List<Integer> ids = gifticons.getContent().stream()
			.map(Gifticon::getId)
			.toList();

		// 파일을 한번에 조회
		Map<Integer, String> pathMap = getFilePathMap(ids);

		return gifticons.getContent().stream()
			.map(dto -> AvailableGifticonResponseDto.builder()
				.gifticonId(dto.getId())
				.gifticonName(dto.getName())
				.gifticonType(dto.getType())
				.gifticonExpiryDate(dto.getExpiryDate())
				.brandId(dto.getBrand().getId())
				.brandName(dto.getBrand().getName())
				.scope(dto.getSharebox() == null ? GifticonScopeType.MY_BOX.name() : GifticonScopeType.SHARE_BOX.name())
				.userId(dto.getUser().getId())
				.userName(dto.getUser().getName())
				.shareboxId(dto.getSharebox() == null ? null : dto.getSharebox().getId())
				.shareboxName(dto.getSharebox() == null ? null : dto.getSharebox().getName())
				.thumbnailPath(
					pathMap.get(dto.getId()) != null ? getSignedUrl(pathMap.get(dto.getId()), FileType.THUMBNAIL) :
						null)
				.build())
			.toList();
	}

	private List<UsedGifticonResponseDto> getUsedGifticonResponseDtos(Integer userId,
		Slice<Gifticon> gifticons) {

		// 기프티콘 id 추출
		List<Integer> ids = gifticons.getContent().stream()
			.map(Gifticon::getId)
			.toList();

		Map<Integer, String> pathMap = getFilePathMap(ids);

		Map<Integer, GifticonOwnerHistory> ownerHistoryMap = getOwnerHistoryMap(userId, ids);

		Map<Integer, UsageHistory> usageHistoryMap = getUsageHistoryMap(userId, ids);

		List<UsedGifticonResponseDto> responseDtos = new ArrayList<>();

		for (Gifticon gifticon : gifticons) {

			Integer gifticonId = gifticon.getId();
			UsageHistory usageHistory = usageHistoryMap.get(gifticonId);
			GifticonOwnerHistory ownerHistory = ownerHistoryMap.get(gifticonId);

			// 사용시간, 타입 처리
			UsageInfo usageInfo = getUsageInfo(usageHistory, ownerHistory);

			// 썸네일 경로 처리
			String thumbnailPath = getThumbnailPath(pathMap, gifticonId);

			UsedGifticonResponseDto newDto = UsedGifticonResponseDto.builder()
				.gifticonId(gifticon.getId())
				.gifticonName(gifticon.getName())
				.gifticonType(gifticon.getType())
				.gifticonExpiryDate(gifticon.getExpiryDate())
				.brandId(gifticon.getBrand().getId())
				.brandName(gifticon.getBrand().getName())
				.usageType(usageInfo.usageType())
				.usedAt(usageInfo.usedAt())
				.thumbnailPath(thumbnailPath)
				.build();

			responseDtos.add(newDto);
		}

		return responseDtos;
	}

	private UsageInfo getUsageInfo(UsageHistory usageHistory, GifticonOwnerHistory ownerHistory) {
		UsageType usageType;
		LocalDateTime usedAt;

		if (usageHistory != null) {
			// 사용 이력이 있으면 SELF_USE로 처리
			usageType = UsageType.SELF_USE;
			usedAt = usageHistory.getCreatedAt();

			return new UsageInfo(usageType, usedAt);
		}

		// 소유권 이력이 있으면 해당 전송 타입으로 처리
		usageType = convertTransferTypeToUsageType(ownerHistory.getTransferType());
		usedAt = ownerHistory.getCreatedAt();

		return new UsageInfo(usageType, usedAt);

	}

	private record UsageInfo(UsageType usageType, LocalDateTime usedAt) {
	}

	private String getThumbnailPath(Map<Integer, String> pathMap, Integer gifticonId) {
		String thumbnailPath = null;
		if (pathMap.containsKey(gifticonId)) {
			thumbnailPath = getSignedUrl(pathMap.get(gifticonId), FileType.THUMBNAIL);
		}
		return thumbnailPath;
	}

	private Map<Integer, UsageHistory> getUsageHistoryMap(Integer userId, List<Integer> ids) {
		// 사용 내역을 한번에 조회
		List<UsageHistory> usageHistories = usageHistoryRepository.findLatestForEachGifticonByIdsAndUserId(ids, userId);

		// 사용 내역 맵 생성 (gifticonId -> 사용 내역)
		Map<Integer, UsageHistory> usageHistoryMap = usageHistories.stream()
			.collect(Collectors.toMap(
				history -> history.getGifticon().getId(),
				history -> history,
				// 만약 중복된 키가 있을 경우, 가장 최근 기록을 유지
				(existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt())
					? existing : replacement
			));
		return usageHistoryMap;
	}

	private Map<Integer, GifticonOwnerHistory> getOwnerHistoryMap(Integer userId, List<Integer> ids) {
		// 소유자 변경 내역을 한번에 조회
		List<GifticonOwnerHistory> ownerHistories = gifticonOwnerHistoryRepository.findLatestForEachGifticonByIdsAndFromUserId(
			ids, userId);

		// 소유권 이력 맵 생성 (gifticonId -> 소유권 이력)
		Map<Integer, GifticonOwnerHistory> ownerHistoryMap = ownerHistories.stream()
			.collect(Collectors.toMap(
				history -> history.getGifticon().getId(),
				history -> history,
				// 만약 중복된 키가 있을 경우, 가장 최근 기록을 유지
				(existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt())
					? existing : replacement
			));
		return ownerHistoryMap;
	}

	private Map<Integer, String> getFilePathMap(List<Integer> ids) {
		// 파일을 한번에 조회
		List<File> thumbs = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
			"gifticon", ids, FileType.THUMBNAIL);

		// 경로 맵 생성 (gifticonId -> 썸네일 경로)
		Map<Integer, String> pathMap = thumbs.stream()
			.collect(Collectors.toMap(File::getReferenceEntityId, File::getPath));
		return pathMap;
	}

	private UsageType convertTransferTypeToUsageType(TransferType transferType) {
		return switch (transferType) {
			case GIVE_AWAY -> UsageType.GIVE_AWAY;
			case PRESENT -> UsageType.PRESENT;
		};
	}
}
