package com.eurachacha.achacha.web.sharebox;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.sharebox.dto.ShareBoxAppService;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;

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
}
