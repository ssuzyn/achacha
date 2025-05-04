package com.eurachacha.achacha.application.service.gifticon;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GifticonAppServiceImpl implements GifticonAppService {

	private final GifticonDomainService gifticonDomainService;
	private final GifticonRepository gifticonRepository;

	@Override
	@Transactional
	public GifticonResponseDto saveGifticon(GifticonSaveRequestDto requestDto) {
		// 도메인 객체 생성
		Gifticon newGifticon = Gifticon.builder()
			.name(requestDto.getName())
			.barcode(requestDto.getBarcode())
			.type(requestDto.getType())
			.expiryDate(requestDto.getExpiryDate())
			.originalAmount(requestDto.getOriginalAmount())
			.remainingAmount(requestDto.getOriginalAmount())
			.sharebox(null)
			.brand(null)
			.build();

		// 도메인 서비스를 통한 유효성 검증
		gifticonDomainService.validateGifticon(newGifticon);

		// 저장소를 통한 영속화
		Gifticon savedGifticon = gifticonRepository.save(newGifticon);

		// 응답 DTO 반환
		return GifticonResponseDto.from(savedGifticon);
	}
}
