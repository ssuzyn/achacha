package com.eurachacha.achacha.domain.service.gifticon;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

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
		return gifticon.getExpireDate().isBefore(LocalDate.now());
	}
}
