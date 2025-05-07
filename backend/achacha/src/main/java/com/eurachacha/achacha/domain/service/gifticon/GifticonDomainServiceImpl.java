package com.eurachacha.achacha.domain.service.gifticon;

import java.time.LocalDate;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class GifticonDomainServiceImpl implements GifticonDomainService {
	// 기프티콘 유효성 검증
	@Override
	public void validateGifticon(Gifticon gifticon) {
		// 유효성 검증 로직 구현
	}

	// 기프티콘 만료 여부 확인
	@Override
	public boolean isExpired(Gifticon gifticon) {
		return gifticon.getExpiryDate().isBefore(LocalDate.now());
	}

	// 기프티콘 조회 권한 여부 확인
	@Override
	public boolean validateGifticonAccess(Integer requestUserId, Integer gifticonUserId) {
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
	public void validateAvailableGifticon(Integer userId, Gifticon gifticon) {

		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		if (isExpired(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_EXPIRED);
		}

		if (gifticon.getSharebox() == null && !validateGifticonAccess(userId, gifticon.getUser().getId())) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}
	}
}
