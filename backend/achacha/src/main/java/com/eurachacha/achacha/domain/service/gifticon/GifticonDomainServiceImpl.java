package com.eurachacha.achacha.domain.service.gifticon;

import java.time.LocalDate;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class GifticonDomainServiceImpl implements GifticonDomainService {

	// 기프티콘 금액 유효성 검증
	@Override
	public void validateGifticonAmount(GifticonType type, Integer amount) {
		// 금액형 기프티콘인데 금액이 없는 경우
		if (type == GifticonType.AMOUNT && amount == null) {
			throw new CustomException(ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
		}

		// 금액형 기프티콘인데 금액이 0 이하인 경우
		if (type == GifticonType.AMOUNT && amount <= 0) {
			throw new CustomException(ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
		}
	}

	// 기프티콘 만료 여부 확인
	@Override
	public boolean isExpired(Gifticon gifticon) {
		return gifticon.getExpiryDate().isBefore(LocalDate.now());
	}

	// 기프티콘 조회 권한 여부 확인
	@Override
	public boolean hasAccess(Integer requestUserId, Integer gifticonUserId) {
		return Objects.equals(requestUserId, gifticonUserId);
	}

	@Override
	public boolean isDeleted(Gifticon gifticon) {
		return gifticon.getIsDeleted();
	}

	@Override
	public boolean isUsed(Gifticon gifticon) {
		return gifticon.getIsUsed();
	}

	@Override
	public void validateGifticonAvailability(Gifticon gifticon) {

		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		if (isExpired(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_EXPIRED);
		}
	}

	@Override
	public void validateGifticonIsUsed(Gifticon gifticon) {

		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		if (!isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
		}
	}

	@Override
	public void validateGifticonIsAvailable(Gifticon gifticon) {
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}
	}

	// 이미 공유된 기프티콘인지 확인
	@Override
	public boolean isAlreadyShared(Gifticon gifticon) {
		return gifticon.getSharebox() != null;
	}

	// 금액형 - 사용한적없는 기프티콘인지 확인
	@Override
	public boolean isAmountGifticonUsed(Gifticon gifticon) {
		if (gifticon.getType() != GifticonType.AMOUNT) {
			return false;
		}

		return !gifticon.getOriginalAmount().equals(gifticon.getRemainingAmount());
	}

	// 쉐어박스에 공유할 수 있는지 검증
	@Override
	public void validateGifticonSharable(Gifticon gifticon) {
		// 삭제된 기프티콘인지 검증
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용된 기프티콘인지 검증
		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 이미 공유된 기프티콘인지 검증
		if (isAlreadyShared(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED);
		}

		// 금액형 기프티콘의 경우, 일부 사용되었는지 검증
		if (isAmountGifticonUsed(gifticon)) {
			throw new CustomException(ErrorCode.CANNOT_SHARE_USED_AMOUNT_GIFTICON);
		}
	}
}
