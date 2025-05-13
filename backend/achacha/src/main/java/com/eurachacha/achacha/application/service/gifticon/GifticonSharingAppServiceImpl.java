package com.eurachacha.achacha.application.service.gifticon;

import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonSharingAppService;
import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.ble.BleToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GifticonSharingAppServiceImpl implements GifticonSharingAppService {

	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final UserRepository userRepository;
	private final BleTokenRepository bleTokenRepository;
	private final GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;

	@Override
	@Transactional
	public void giveAwayGifticon(Integer gifticonId, List<String> uuids) {

		Integer userId = 1; // 유저 로직 추가 시 변경 필요

		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 공유 여부 검증
		gifticonDomainService.validateGiveAwayGifticon(userId, findGifticon);

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

		// 주는 사람 객체
		User senderUser = userRepository.findById(userId); // 유저 로직 추가 시 변경 필요

		// 기프티콘 소유권 업데이트
		findGifticon.updateUser(receiverUser);

		GifticonOwnerHistory newGifticonOwnerHistory = GifticonOwnerHistory.builder()
			.gifticon(findGifticon)
			.fromUser(senderUser) // 유저 로직 추가 시 변경 필요
			.toUser(receiverUser)
			.transferType(TransferType.GIVE_AWAY)
			.build();

		// 전송 내역 저장
		gifticonOwnerHistoryRepository.save(newGifticonOwnerHistory);
	}

	private String getRandomUuid(List<String> validUuids) {
		Random random = new Random();
		return validUuids.get(random.nextInt(validUuids.size()));
	}
}
