package com.eurachacha.achacha.application.service.gifticon;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonUsageAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
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

	@Override
	@Transactional
	public String useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 *  3. 유효기간 여부 판단
		 */
		gifticonDomainService.validateGifticonAvailability(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 잔액 검증
		boolean hasBalance = gifticonUsageDomainService.hasBalance(findGifticon, requestDto.getUsageAmount());
		if (hasBalance) {
			throw new CustomException(ErrorCode.GIFTICON_INSUFFICIENT_BALANCE);
		}

		// 사용 처리
		findGifticon.use(requestDto.getUsageAmount());

		// 사용 기록 생성
		UsageHistory newUsageHistory = UsageHistory.builder()
			.user(null) // 유저 로직 추가 시 변경 필요
			.gifticon(findGifticon)
			.usageAmount(requestDto.getUsageAmount())
			.build();

		// 사용 기록 처리
		usageHistoryRepository.saveUsageHistory(newUsageHistory);

		return "기프티콘이 사용되었습니다.";
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
