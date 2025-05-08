package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonDomainService {
	// 금액형 기프티콘 유효성 검증
	void validateGifticonAmount(GifticonType type, Integer amount);

	// 기프티콘 만료 여부 확인
	boolean isExpired(Gifticon gifticon);

	// 기프티콘 조회 권한 여부 확인
	boolean validateGifticonAccess(Integer requestUserId, Integer gifticonUserId);

	// 기프티콘 삭제 여부 확인
	boolean isDeleted(Gifticon gifticon);

	// 기프티콘 사용 여부 확인
	boolean isUsed(Gifticon gifticon);

	void validateGifticonAvailability(Integer userId, Gifticon gifticon);
}
