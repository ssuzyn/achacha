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
	public void validateGifticonAccess(Integer requestUserId, Integer gifticonUserId) {
		if (!Objects.equals(requestUserId, gifticonUserId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}
	}
}
