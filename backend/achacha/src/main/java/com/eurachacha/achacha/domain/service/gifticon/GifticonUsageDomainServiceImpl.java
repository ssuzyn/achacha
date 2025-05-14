package com.eurachacha.achacha.domain.service.gifticon;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class GifticonUsageDomainServiceImpl implements GifticonUsageDomainService {

	@Override // 기프티콘 잔액 계산 (잔액이 부족한 경우 예외 발생)
	public int getFindGifticonRemainingAmount(Integer newAmount, UsageHistory findUsageHistory,
		Gifticon findGifticon) {
		int currentUsageAmount = findUsageHistory.getUsageAmount(); //이전 사용 금액
		int currentRemainingAmount = findGifticon.getRemainingAmount(); // 현재 잔액

		// 금액 증가 케이스 (추가 차감)
		if (newAmount > currentUsageAmount) {
			int additionalAmount = newAmount - currentUsageAmount;
			validateSufficientBalance(currentRemainingAmount, additionalAmount);
			return currentRemainingAmount - additionalAmount;
		}

		// 금액 감소 케이스 (환불)
		int refundAmount = currentUsageAmount - newAmount;
		return currentRemainingAmount + refundAmount;
	}

	@Override
	public void validateUseAmountGifticon(Gifticon gifticon, Integer usageAmount) {

		// 잔액 검증
		validateSufficientBalance(gifticon.getRemainingAmount(), usageAmount);

		// 사용 금액 검증
		validateAmount(usageAmount);
	}

	@Override
	public int updateUsageHistory(Integer newAmount, Gifticon findGifticon,
		UsageHistory findUsageHistory) {

		// 변경 금액이 유효한지 확인
		validateAmount(newAmount);

		// 잔액 계산
		return getFindGifticonRemainingAmount(newAmount, findUsageHistory, findGifticon);
	}

	@Override // 금액 유효성 검증 (0 이하)
	public void validateAmount(Integer newAmount) {
		if (newAmount <= 0) {
			throw new CustomException(ErrorCode.INVALID_AMOUNT_VALUE);
		}
	}

	@Override
	public void validateSufficientBalance(int remainingAmount, int requiredAmount) {
		if (remainingAmount < requiredAmount) {
			throw new CustomException(ErrorCode.GIFTICON_INSUFFICIENT_BALANCE);
		}
	}
}
