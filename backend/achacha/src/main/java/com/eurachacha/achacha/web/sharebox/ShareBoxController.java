package com.eurachacha.achacha.web.sharebox;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.sharebox.dto.ShareBoxAppService;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxParticipantsResponseDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/share-boxes")
@RestController
@RequiredArgsConstructor
public class ShareBoxController {

	private final ShareBoxAppService shareBoxAppService;

	// 쉐어박스 생성 엔드포인트
	@PostMapping
	public ResponseEntity<ShareBoxCreateResponseDto> createShareBox(
		@Valid @RequestBody ShareBoxCreateRequestDto requestDto) {

		ShareBoxCreateResponseDto responseDto = shareBoxAppService.createShareBox(requestDto);
		return ResponseEntity.ok(responseDto);
	}

	// 쉐어박스 참여 엔드포인트
	@PostMapping("/{shareBoxId}/join")
	public ResponseEntity<String> joinShareBox(
		@PathVariable Integer shareBoxId,
		@Valid @RequestBody ShareBoxJoinRequestDto requestDto) {

		shareBoxAppService.joinShareBox(shareBoxId, requestDto);
		return ResponseEntity.ok("쉐어박스에 성공적으로 참여했습니다.");
	}

	// 쉐어박스 기프티콘 공유 엔드포인트
	@PostMapping("/{shareBoxId}/gifticons/{gifticonId}")
	public ResponseEntity<String> shareGifticon(
		@PathVariable Integer shareBoxId,
		@PathVariable Integer gifticonId) {

		shareBoxAppService.shareGifticon(shareBoxId, gifticonId);
		return ResponseEntity.ok("공유 완료했습니다.");
	}

	// 쉐어박스 기프티콘 공유 해제 엔드포인트
	@DeleteMapping("/{shareBoxId}/gifticons/{gifticonId}")
	public ResponseEntity<String> unshareGifticon(
		@PathVariable Integer shareBoxId,
		@PathVariable Integer gifticonId) {

		shareBoxAppService.unshareGifticon(shareBoxId, gifticonId);
		return ResponseEntity.ok("공유 해제 완료했습니다.");
	}

	// 쉐어박스 참여자 조회
	@GetMapping("/{shareBoxId}/users")
	public ResponseEntity<ShareBoxParticipantsResponseDto> getShareBoxParticipants(
		@PathVariable Integer shareBoxId) {
		return ResponseEntity.ok(shareBoxAppService.getShareBoxParticipants(shareBoxId));
	}
}
