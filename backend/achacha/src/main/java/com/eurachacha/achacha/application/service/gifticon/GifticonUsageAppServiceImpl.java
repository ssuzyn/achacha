package com.eurachacha.achacha.application.service.gifticon;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonUsageAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AmountGifticonUsageHistoriesResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.ProductGifticonUsageHistoryResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonUsageDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GifticonUsageAppServiceImpl implements GifticonUsageAppService {

	private final ParticipationRepository participationRepository;
	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final GifticonUsageDomainService gifticonUsageDomainService;
	private final UsageHistoryRepository usageHistoryRepository;
	private final UserRepository userRepository; // 유저 로직 추가 시 변경 필요

	@Override
	@Transactional
	public void useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 *  3. 타입 판단
		 */
		gifticonDomainService.validateDeleteAndUsedAndAmountType(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 잔액, 사용금액 검증
		gifticonUsageDomainService.validateSufficientBalance(findGifticon.getRemainingAmount(),
			requestDto.getUsageAmount());

		// 사용 처리
		findGifticon.use(requestDto.getUsageAmount());

		User findUser = userRepository.findById(userId); // 유저 로직 추가 시 변경 필요

		// 사용 기록 생성
		UsageHistory newUsageHistory = UsageHistory.builder()
			.user(findUser) // 유저 로직 추가 시 변경 필요
			.gifticon(findGifticon)
			.usageAmount(requestDto.getUsageAmount())
			.build();

		// 사용 기록 처리
		usageHistoryRepository.saveUsageHistory(newUsageHistory);
	}

	@Override
	public AmountGifticonUsageHistoriesResponseDto getAmountGifticonUsageHistories(Integer gifticonId) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 삭제 여부, 타입 검증
		gifticonDomainService.validateAmountGifticonUsageHistories(findGifticon);

		// 조회 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 사용 내역 조회
		List<UsageHistory> findUsageHistories = usageHistoryRepository.findAmountGifticonUsageHistories(gifticonId);

		// entity -> dto로 변환
		List<AmountGifticonUsageHistoriesResponseDto.UsageHistoryDto> usageHistoryResponseDtos = findUsageHistories.stream()
			.map(history -> AmountGifticonUsageHistoriesResponseDto.UsageHistoryDto.builder()
				.usageHistoryId(history.getId())
				.usageAmount(history.getUsageAmount())
				.usageHistoryCreatedAt(history.getCreatedAt())
				.userId(history.getUser().getId())
				.userName(history.getUser().getName())
				.build())
			.toList();

		return AmountGifticonUsageHistoriesResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonOriginalAmount(findGifticon.getOriginalAmount())
			.gifticonRemainingAmount(findGifticon.getRemainingAmount())
			.usageHistories(usageHistoryResponseDtos)
			.build();
	}

	@Override
	@Transactional
	public void updateGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId,
		AmountGifticonUseRequestDto requestDto) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 사용 가능한 기프티콘인지 확인
		gifticonDomainService.validateDeleteAndUsedAndAmountType(findGifticon);

		// 해당 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findByIdAndGifticonIdAndUserId(usageHistoryId,
			gifticonId, userId);

		int newAmount = requestDto.getUsageAmount();

		// 잔액 및 사용 내역 업데이트
		findGifticon.updateRemainingAmount(
			gifticonUsageDomainService.updateUsageHistory(newAmount, findGifticon, findUsageHistory));
		findUsageHistory.updateUsageAmount(newAmount);
	}

	@Override
	@Transactional
	public void deleteGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 삭제, 사용, 타입 검증
		gifticonDomainService.validateDeleteAndUsedAndAmountType(findGifticon);

		// 해당 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findByIdAndGifticonIdAndUserId(usageHistoryId,
			gifticonId, userId);

		// 삭제
		usageHistoryRepository.delete(findUsageHistory);
		// 잔액 복구
		findGifticon.updateRemainingAmount(findGifticon.getRemainingAmount() + findUsageHistory.getUsageAmount());
	}

	@Override
	@Transactional
	public void useProductGifticon(Integer gifticonId) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 */
		gifticonDomainService.validateDeleteAndUsedAndProductType(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 사용 처리
		findGifticon.use();

		User findUser = userRepository.findById(userId); // 유저 로직 추가 시 변경 필요

		// 사용 기록 생성
		UsageHistory newUsageHistory = UsageHistory.builder()
			.user(findUser) // 유저 로직 추가 시 변경 필요
			.gifticon(findGifticon)
			.usageAmount(null)
			.build();

		// 사용 기록 처리
		usageHistoryRepository.saveUsageHistory(newUsageHistory);
	}

	@Override
	public ProductGifticonUsageHistoryResponseDto getProductGifticonUsageHistories(Integer gifticonId) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 사용, 삭제 여부 판단
		gifticonDomainService.validateDeleteAndIsUsedAndProductType(findGifticon);

		// 조회 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.getUsageHistoryDetail(userId, gifticonId);

		// entity -> dto 변환
		ProductGifticonUsageHistoryResponseDto.UsageHistoryDto usageHistoryResponseDto = ProductGifticonUsageHistoryResponseDto.UsageHistoryDto
			.builder()
			.usageHistoryId(findUsageHistory.getId())
			.usageHistoryCreatedAt(findUsageHistory.getCreatedAt())
			.userId(findUsageHistory.getUser().getId())
			.userName(findUsageHistory.getUser().getName())
			.build();

		return ProductGifticonUsageHistoryResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.usageHistory(usageHistoryResponseDto)
			.build();
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
}
