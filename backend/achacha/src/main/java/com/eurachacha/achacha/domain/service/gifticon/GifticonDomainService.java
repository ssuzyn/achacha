package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonDomainService {
	// 금액형 기프티콘 유효성 검증
	void validateGifticonAmount(GifticonType type, Integer amount);

	// 기프티콘 만료 여부 확인
	boolean isExpired(Gifticon gifticon);

	// 기프티콘 소유 여부 확인
	boolean hasAccess(Integer requestUserId, Integer gifticonUserId);

	// 기프티콘 삭제 여부 확인
	boolean isDeleted(Gifticon gifticon);

	// 기프티콘 사용 여부 확인
	boolean isUsed(Gifticon gifticon);

	void validateGifticonAvailability(Gifticon gifticon);

	void validateGifticonIsUsed(Gifticon gifticon);

	void validateGifticonIsAvailable(Gifticon gifticon);

	boolean isAlreadyShared(Gifticon gifticon);

	boolean isAmountGifticonUsed(Gifticon gifticon);

	// 쉐어박스에 공유중인 기프티콘인지 검증
	void validateGifticonSharable(Gifticon gifticon);

	// 해당 쉐어박스에 기프티콘이 올라가있는지 검증
	void validateGifticonSharedInShareBox(Gifticon gifticon, Integer shareBoxId);
}
