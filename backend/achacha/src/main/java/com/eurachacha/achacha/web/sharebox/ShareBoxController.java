package com.eurachacha.achacha.web.sharebox;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.sharebox.dto.ShareBoxAppService;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/share-boxes")
@RestController
@RequiredArgsConstructor
public class ShareBoxController {

	private final ShareBoxAppService shareBoxAppService;

	@PostMapping
	public ResponseEntity<ShareBoxCreateResponseDto> createShareBox(
		@Valid @RequestBody ShareBoxCreateRequestDto requestDto) {

		ShareBoxCreateResponseDto responseDto = shareBoxAppService.createShareBox(requestDto);
		return ResponseEntity.ok(responseDto);
	}
}
