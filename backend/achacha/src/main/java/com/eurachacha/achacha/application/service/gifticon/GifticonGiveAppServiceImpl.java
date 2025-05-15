package com.eurachacha.achacha.application.service.gifticon;

import java.security.SecureRandom;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonGiveAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonPresentRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonPresentResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.application.port.output.present.PresentCardRepository;
import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.ble.BleToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.domain.model.present.PresentCard;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;
import com.eurachacha.achacha.domain.model.present.enums.TemplateCategory;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonGiveDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GifticonGiveAppServiceImpl implements GifticonGiveAppService {
	private static final int MAX_ATTEMPTS = 3;

	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final BleTokenRepository bleTokenRepository;
	private final GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;
	private final SecurityServicePort securityServicePort;
	private final GifticonGiveDomainService gifticonGiveDomainService;
	private final UserRepository userRepository;
	private final BleTokenRepository bleTokenRepository;
	private final GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;
	private final PresentTemplateRepository presentTemplateRepository;
	private final ColorPaletteRepository colorPaletteRepository;
	private final SecurityServicePort securityServicePort;
	private final PresentCardRepository presentCardRepository;

	@Override
	@Transactional
	public void giveAwayGifticon(Integer gifticonId, List<String> uuids) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 삭제, 사용, 공유 여부, 타입 검증
		gifticonDomainService.validateGifticonForGiveAway(userId, findGifticon);

		// 유효한 uuid만 필터링
		List<String> validUuids = bleTokenRepository.findValuesByValueIn(uuids);

		// 유효한 UUID가 있는지 확인
		if (validUuids.isEmpty()) {
			throw new CustomException(ErrorCode.NO_NEARBY_PEOPLES);
		}

		String selectedUuid = getRandomUuid(validUuids);

		// 받는 사람 ble 토큰 객체
		BleToken findToken = bleTokenRepository.findByValue(selectedUuid);

		// 받는 사람 객체
		User receiverUser = findToken.getUser();

		// 기프티콘 소유권 업데이트
		findGifticon.updateUser(receiverUser);

		GifticonOwnerHistory newGifticonOwnerHistory = GifticonOwnerHistory.builder()
			.gifticon(findGifticon)
			.fromUser(loggedInUser) // 유저 로직 추가 시 변경 필요
			.toUser(receiverUser)
			.transferType(TransferType.GIVE_AWAY)
			.build();

		// 전송 내역 저장
		gifticonOwnerHistoryRepository.save(newGifticonOwnerHistory);
	}

	@Override
	@Transactional
	public GifticonPresentResponseDto presentGifticon(Integer gifticonId,
		GifticonPresentRequestDto gifticonPresentRequestDto) {
		User user = securityServicePort.getLoggedInUser();

		Gifticon gifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 기프티콘 검증
		gifticonDomainService.validateGifticonForPresent(user.getId(), gifticon);

		// 선물카드 템플릿 검증
		PresentTemplate presentTemplate = presentTemplateRepository.findById(
			gifticonPresentRequestDto.getPresentTemplateId());

		// GENERAL 타입인 경우 색상 정보 검증
		ColorPalette colorPalette = null;
		if (presentTemplate.getCategory().equals(TemplateCategory.GENERAL)) {
			colorPalette = colorPaletteRepository.findByColorPaletteId(gifticonPresentRequestDto.getColorPaletteId());
		}

		// 기프티콘 사용 완료 처리
		gifticon.use();

		// 기프티콘 소유자 변경 내역 저장
		GifticonOwnerHistory newGifticonOwnerHistory = GifticonOwnerHistory.builder()
			.gifticon(gifticon)
			.fromUser(user)
			.toUser(null) // 선물의 경우 받는 사람은 null 처리
			.transferType(TransferType.PRESENT)
			.build();
		gifticonOwnerHistoryRepository.save(newGifticonOwnerHistory);

		// 고유한 선물카드 코드 생성
		String presentCardCode = generateUniquePresentCardCode();

		// 선물 카드 저장
		PresentCard presentCard = PresentCard.builder()
			.code(presentCardCode)
			.message(gifticonPresentRequestDto.getMessage())
			.user(user)
			.gifticon(gifticon)
			.presentTemplate(presentTemplate)
			.colorPalette(colorPalette)
			.build();
		presentCardRepository.save(presentCard);

		return GifticonPresentResponseDto.builder()
			.presentCardCode(presentCardCode)
			.gifticonName(gifticon.getName())
			.brandName(gifticon.getBrand().getName())
			.build();
	}

	private String getRandomUuid(List<String> validUuids) {
		Random random = new Random();
		return validUuids.get(random.nextInt(validUuids.size()));
	}

	// 고유한 선물카드 코드 생성 메서드
	private String generateUniquePresentCardCode() {

		SecureRandom random = new SecureRandom();
		String presentCardCode;
		int attempts = 0;

		// 도메인 서비스에서 정의한 규칙 활용
		String allowedCharacters = gifticonGiveDomainService.getAllowedCharacters();
		int codeLength = gifticonGiveDomainService.getRecommendedPresentCardCodeLength();

		do {
			if (attempts >= MAX_ATTEMPTS) {
				throw new CustomException(ErrorCode.PRESENT_CODE_GENERATION_FAILED);
			}

			presentCardCode = random.ints(codeLength, 0, allowedCharacters.length())
				.mapToObj(i -> String.valueOf(allowedCharacters.charAt(i)))
				.collect(Collectors.joining());

			attempts++;
		} while (presentCardRepository.existsByPresentCardCode(presentCardCode));

		return presentCardCode;
	}
}
