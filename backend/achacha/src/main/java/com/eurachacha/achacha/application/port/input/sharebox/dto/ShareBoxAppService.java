package com.eurachacha.achacha.application.port.input.sharebox.dto;

import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;

public interface ShareBoxAppService {
	ShareBoxCreateResponseDto createShareBox(ShareBoxCreateRequestDto requestDto);
}
