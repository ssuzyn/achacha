package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

public interface GifticonDomainService {
	// 기프티콘 유효성 검증
	void validateGifticon(Gifticon gifticon);

	// 기프티콘 만료 여부 확인
	boolean isExpired(Gifticon gifticon);

	// 기프티콘 조회 권한 여부 확인
	void validateGifticonAccess(Integer requestUserId, Integer gifticonUserId);
}
