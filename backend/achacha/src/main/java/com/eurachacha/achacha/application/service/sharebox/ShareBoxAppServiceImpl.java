package com.eurachacha.achacha.application.service.sharebox;

import java.security.SecureRandom;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.sharebox.dto.ShareBoxAppService;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.sharebox.ShareBoxDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ShareBoxAppServiceImpl implements ShareBoxAppService {
	private static final int MAX_ATTEMPTS = 3;

	private final ShareBoxDomainService shareBoxDomainService;
	private final GifticonDomainService gifticonDomainService;
	private final ShareBoxRepository shareBoxRepository;
	private final GifticonRepository gifticonRepository;
	private final UserRepository userRepository;
	private final ParticipationRepository participationRepository;

	@Transactional
	@Override
	public ShareBoxCreateResponseDto createShareBox(ShareBoxCreateRequestDto requestDto) {
		log.info("쉐어박스 생성 시작 - 이름: {}", requestDto.getShareBoxName());

		// 쉐어박스 이름 유효성 검증 - 도메인 서비스 활용
		shareBoxDomainService.validateShareBoxName(requestDto.getShareBoxName());

		// 현재 사용자 조회 (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요
		User user = userRepository.findById(userId);

		// 고유한 초대 코드 생성
		String inviteCode = generateUniqueInviteCode();

		// 쉐어박스 도메인 객체 생성
		ShareBox shareBox = ShareBox.builder()
			.name(requestDto.getShareBoxName())
			.inviteCode(inviteCode)
			.allowParticipation(true)
			.user(user)
			.build();

		// 저장소를 통한 영속화
		ShareBox savedShareBox = shareBoxRepository.save(shareBox);

		// 쉐어박스 생성자를 참여자로 추가
		saveParticipation(user, savedShareBox);

		log.info("쉐어박스 생성 완료 (ID: {}, 초대 코드: {})", savedShareBox.getId(), savedShareBox.getInviteCode());

		return ShareBoxCreateResponseDto.builder()
			.shareBoxInviteCode(savedShareBox.getInviteCode())
			.build();
	}

	@Transactional
	@Override
	public void joinShareBox(Integer shareBoxId, ShareBoxJoinRequestDto requestDto) {
		log.info("쉐어박스 참여 시작 - 쉐어박스 ID: {}, 초대 코드: {}", shareBoxId, requestDto.getShareBoxInviteCode());

		// 현재 사용자 조회 (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요
		User user = userRepository.findById(userId);

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 초대 코드 검증
		shareBoxDomainService.validateInviteCode(shareBox, requestDto.getShareBoxInviteCode());

		// 참여 가능 여부 검증
		shareBoxDomainService.validateParticipationAllowed(shareBox);

		// 이미 참여 중인지 확인
		if (participationRepository.checkParticipation(userId, shareBoxId)) {
			throw new CustomException(ErrorCode.ALREADY_PARTICIPATING_SHAREBOX);
		}

		// 최대 참여자 수 확인
		int currentParticipants = participationRepository.countByShareboxId(shareBoxId);
		shareBoxDomainService.validateParticipantCount(currentParticipants);

		// 참여 정보 저장
		Participation participation = Participation.builder()
			.user(user)
			.sharebox(shareBox)
			.build();

		participationRepository.save(participation);

		log.info("쉐어박스 참여 완료 - 사용자 ID: {}, 쉐어박스 ID: {}", userId, shareBoxId);
	}

	@Transactional
	@Override
	public void shareGifticon(Integer shareBoxId, Integer gifticonId) {
		log.info("기프티콘 공유 시작 - 쉐어박스 ID: {}, 기프티콘 ID: {}", shareBoxId, gifticonId);

		// 현재 사용자 조회 (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 쉐어박스 참여 여부 검증
		if (!participationRepository.checkParticipation(userId, shareBoxId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_SHAREBOX_ACCESS);
		}

		// 기프티콘 조회
		Gifticon gifticon = gifticonRepository.findById(gifticonId);

		// 기프티콘 소유권 검증
		if (!gifticonDomainService.hasAccess(userId, gifticon.getUser().getId())) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}

		// 기프티콘 공유 가능 여부 검증
		gifticonDomainService.validateGifticonSharable(gifticon);

		// 기프티콘의 쉐어박스 업데이트
		gifticon.updateShareBox(shareBox);

		// 변경사항 저장
		gifticonRepository.save(gifticon);

		log.info("기프티콘 공유 완료 - 기프티콘 ID: {}, 쉐어박스 ID: {}", gifticonId, shareBoxId);
	}

	// 고유한 초대 코드 생성 메서드
	private String generateUniqueInviteCode() {
		SecureRandom random = new SecureRandom();
		String inviteCode;
		int attempts = 0;

		// 도메인 서비스에서 정의한 규칙 활용
		String allowedCharacters = shareBoxDomainService.getAllowedCharacters();
		int codeLength = shareBoxDomainService.getRecommendedInviteCodeLength();

		do {
			if (attempts >= MAX_ATTEMPTS) {
				throw new CustomException(ErrorCode.INVITE_CODE_GENERATION_FAILED);
			}

			inviteCode = random.ints(codeLength, 0, allowedCharacters.length())
				.mapToObj(i -> String.valueOf(allowedCharacters.charAt(i)))
				.collect(Collectors.joining());

			attempts++;
		} while (shareBoxRepository.existsByInviteCode(inviteCode));

		return inviteCode;
	}

	// Participation 저장 메서드 추가
	private void saveParticipation(User user, ShareBox shareBox) {
		Participation participation = Participation.builder()
			.user(user)
			.sharebox(shareBox)
			.build();

		participationRepository.save(participation);
		log.info("쉐어박스 참여 정보 저장 완료 (사용자 ID: {}, 쉐어박스 ID: {})", user.getId(), shareBox.getId());
	}
}
