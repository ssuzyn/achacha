package com.eurachacha.achacha.application.service.sharebox;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.sharebox.ShareBoxAppService;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxNameUpdateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxParticipationSettingRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ParticipantResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxParticipantsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxSettingsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxesResponseDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.sharebox.enums.ShareBoxSortType;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.sharebox.ShareBoxDomainService;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.PageableFactory;
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
	private final PageableFactory pageableFactory;

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
	public void joinShareBox(ShareBoxJoinRequestDto requestDto) {
		log.info("쉐어박스 참여 시작 - 초대 코드: {}", requestDto.getShareBoxInviteCode());

		// 현재 사용자 조회 (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요
		User user = userRepository.findById(userId);

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findByInviteCode(requestDto.getShareBoxInviteCode());

		// 참여 가능 여부 검증
		shareBoxDomainService.validateParticipationAllowed(shareBox);

		// 이미 참여 중인지 확인
		if (participationRepository.checkParticipation(userId, shareBox.getId())) {
			throw new CustomException(ErrorCode.ALREADY_PARTICIPATING_SHAREBOX);
		}

		// 참여자 수 확인
		int currentParticipants = participationRepository.countByShareboxId(shareBox.getId());
		shareBoxDomainService.validateParticipantCount(currentParticipants);

		// 참여 정보 저장
		Participation participation = Participation.builder()
			.user(user)
			.sharebox(shareBox)
			.build();

		participationRepository.save(participation);

		log.info("쉐어박스 참여 완료 - 사용자 ID: {}, 쉐어박스 ID: {}", userId, shareBox.getId());
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

	@Transactional
	@Override
	public void unshareGifticon(Integer shareBoxId, Integer gifticonId) {
		log.info("기프티콘 공유 해제 시작 - 쉐어박스 ID: {}, 기프티콘 ID: {}", shareBoxId, gifticonId);

		// 현재 사용자 조회 (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 존재 여부 확인
		if (!shareBoxRepository.existsById(shareBoxId)) {
			throw new CustomException(ErrorCode.SHAREBOX_NOT_FOUND);
		}

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

		// 현재 쉐어박스에 공유된 기프티콘인지 검증
		gifticonDomainService.validateGifticonSharedInShareBox(gifticon, shareBoxId);

		// 기프티콘 공유 해제 (쉐어박스 연결 제거)
		gifticon.updateShareBox(null);

		log.info("기프티콘 공유 해제 완료 - 기프티콘 ID: {}, 쉐어박스 ID: {}", gifticonId, shareBoxId);
	}

	@Override
	public ShareBoxesResponseDto getShareBoxes(ShareBoxSortType sort, Integer page, Integer size) {
		log.info("쉐어박스 목록 조회 시작");

		// 현재 사용자 조회 (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 참여 중인 쉐어박스 목록 조회
		Slice<ShareBox> shareBoxSlice = shareBoxRepository.findParticipatedShareBoxes(userId, pageable);

		// 결과가 없을 경우 빈 응답 반환
		if (shareBoxSlice.isEmpty()) {
			return ShareBoxesResponseDto.builder()
				.shareBoxes(List.of())
				.hasNextPage(false)
				.nextPage(null)
				.build();
		}

		// 쉐어박스 ID 목록 추출
		List<Integer> shareBoxIds = shareBoxSlice.getContent().stream()
			.map(ShareBox::getId)
			.collect(Collectors.toList());

		// 각 쉐어박스별 기프티콘 개수 조회
		Map<Integer, Long> gifticonCountMap = gifticonRepository.countGifticonsByShareBoxIds(shareBoxIds);

		// DTO 변환
		List<ShareBoxResponseDto> shareBoxResponseDtos = shareBoxSlice.getContent().stream()
			.map(shareBox -> ShareBoxResponseDto.builder()
				.shareBoxId(shareBox.getId())
				.shareBoxName(shareBox.getName())
				.shareBoxUserId(shareBox.getUser().getId())
				.shareBoxUserName(shareBox.getUser().getName())
				.gifticonCount(gifticonCountMap.getOrDefault(shareBox.getId(), 0L).intValue())
				.build())
			.collect(Collectors.toList());

		log.info("쉐어박스 목록 조회 완료");

		return ShareBoxesResponseDto.builder()
			.shareBoxes(shareBoxResponseDtos)
			.hasNextPage(shareBoxSlice.hasNext())
			.nextPage(shareBoxSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Transactional
	@Override
	public void updateParticipationSetting(Integer shareBoxId, ShareBoxParticipationSettingRequestDto requestDto) {
		log.info("쉐어박스 참여 설정 변경 시작 - 쉐어박스 ID: {}, 참여 허용: {}",
			shareBoxId, requestDto.getShareBoxAllowParticipation());

		// 현재 사용자 ID (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 방장 권한 검증
		shareBoxDomainService.validateShareBoxOwner(shareBox, userId);

		// 참여 설정 변경
		shareBox.updateAllowParticipation(requestDto.getShareBoxAllowParticipation());

		log.info("쉐어박스 참여 설정 변경 완료 - 쉐어박스 ID: {}", shareBoxId);
	}

	@Transactional
	@Override
	public void updateShareBoxName(Integer shareBoxId, ShareBoxNameUpdateRequestDto requestDto) {
		log.info("쉐어박스 이름 변경 시작 - 쉐어박스 ID: {}, 새 이름: {}",
			shareBoxId, requestDto.getShareBoxName());

		// 현재 사용자 ID (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 방장 권한 검증 (도메인 서비스 활용)
		shareBoxDomainService.validateShareBoxOwner(shareBox, userId);

		// 이름 유효성 검증
		shareBoxDomainService.validateShareBoxName(requestDto.getShareBoxName());

		// 이름 변경
		shareBox.updateName(requestDto.getShareBoxName());

		log.info("쉐어박스 이름 변경 완료 - 쉐어박스 ID: {}", shareBoxId);
	}

	@Transactional
	@Override
	public void leaveShareBox(Integer shareBoxId) {
		log.info("쉐어박스 탈퇴 시작 - 쉐어박스 ID: {}", shareBoxId);

		// 현재 사용자 ID (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 참여 여부 확인
		if (!participationRepository.checkParticipation(userId, shareBoxId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_SHAREBOX_ACCESS);
		}

		// 방장 여부 확인
		boolean isOwner = shareBoxDomainService.isShareBoxOwner(shareBox, userId);

		// 방장인 경우 쉐어박스 삭제
		if (isOwner) {
			log.info("방장의 쉐어박스 탈퇴로 인한 쉐어박스 삭제 - 쉐어박스 ID: {}", shareBoxId);

			// 1. 모든 쉐어박스 연결 기프티콘 해제 (벌크 업데이트)
			gifticonRepository.unshareAllGifticonsByShareBoxId(shareBoxId);
			// 2. 모든 참여 정보 삭제
			participationRepository.deleteAllByShareBoxId(shareBoxId);
			// 3. 쉐어박스 삭제
			shareBoxRepository.delete(shareBox);

			return;
		}

		// 일반 참여자인 경우
		log.info("일반 참여자의 쉐어박스 탈퇴 - 사용자 ID: {}, 쉐어박스 ID: {}", userId, shareBoxId);

		// 1. 사용자의 사용 가능한 기프티콘 공유 해제 (벌크 업데이트)
		gifticonRepository.unshareAllAvailableGifticonsByUserIdAndShareBoxId(userId, shareBoxId);

		// 2. 참여 정보 삭제
		participationRepository.deleteByUserIdAndShareBoxId(userId, shareBoxId);

		log.info("쉐어박스 탈퇴 완료 - 사용자 ID: {}, 쉐어박스 ID: {}", userId, shareBoxId);
	}

	@Override
	public ShareBoxSettingsResponseDto getShareBoxSettings(Integer shareBoxId) {
		log.info("쉐어박스 설정 조회 시작 - 쉐어박스 ID: {}", shareBoxId);

		// 현재 사용자 ID (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 참여 권한 검증
		if (!participationRepository.checkParticipation(userId, shareBoxId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_SHAREBOX_ACCESS);
		}

		log.info("쉐어박스 설정 조회 완료 - 쉐어박스 ID: {}", shareBoxId);

		// 응답 DTO 생성
		return ShareBoxSettingsResponseDto.builder()
			.shareBoxId(shareBox.getId())
			.shareBoxName(shareBox.getName())
			.shareBoxAllowParticipation(shareBox.getAllowParticipation())
			.shareBoxInviteCode(shareBox.getInviteCode())
			.build();
	}

	@Override
	public ShareBoxParticipantsResponseDto getShareBoxParticipants(Integer shareBoxId) {
		log.info("쉐어박스 참여자 조회 시작 - 쉐어박스 ID: {}", shareBoxId);

		// 현재 사용자 ID (인증 구현 시 변경 필요)
		Integer userId = 1; // 인증 구현 시 변경 필요

		// 쉐어박스 조회
		ShareBox shareBox = shareBoxRepository.findById(shareBoxId);

		// 참여 권한 검증
		if (!participationRepository.checkParticipation(userId, shareBoxId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_SHAREBOX_ACCESS);
		}

		// 참여자 목록 조회
		List<Participation> participations = participationRepository.findByShareBoxId(shareBoxId);

		// 참여자 DTO 변환
		List<ParticipantResponseDto> participantDtos = participations.stream()
			.map(p -> ParticipantResponseDto.builder()
				.userId(p.getUser().getId())
				.userName(p.getUser().getName())
				.build())
			.collect(Collectors.toList());

		log.info("쉐어박스 참여자 조회 완료 - 참여자 수: {}", participantDtos.size());

		// 응답 DTO 생성
		return ShareBoxParticipantsResponseDto.builder()
			.shareBoxId(shareBox.getId())
			.shareBoxName(shareBox.getName())
			.shareBoxUserId(shareBox.getUser().getId())
			.shareBoxUserName(shareBox.getUser().getName())
			.participations(participantDtos)
			.build();
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
