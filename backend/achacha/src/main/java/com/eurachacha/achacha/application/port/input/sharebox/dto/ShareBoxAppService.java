package com.eurachacha.achacha.application.port.input.sharebox.dto;

import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;

public interface ShareBoxAppService {
	ShareBoxCreateResponseDto createShareBox(ShareBoxCreateRequestDto requestDto);

	void joinShareBox(Integer shareBoxId, ShareBoxJoinRequestDto requestDto);

	void shareGifticon(Integer shareBoxId, Integer gifticonId);
}
