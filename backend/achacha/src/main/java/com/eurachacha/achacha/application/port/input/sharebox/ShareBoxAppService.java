package com.eurachacha.achacha.application.port.input.sharebox.dto;

import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxParticipantsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxesResponseDto;
import com.eurachacha.achacha.domain.model.sharebox.enums.ShareBoxSortType;

public interface ShareBoxAppService {
	ShareBoxCreateResponseDto createShareBox(ShareBoxCreateRequestDto requestDto);

	void joinShareBox(Integer shareBoxId, ShareBoxJoinRequestDto requestDto);

	void shareGifticon(Integer shareBoxId, Integer gifticonId);

	void unshareGifticon(Integer shareBoxId, Integer gifticonId);

	ShareBoxParticipantsResponseDto getShareBoxParticipants(Integer shareBoxId);

	ShareBoxesResponseDto getShareBoxes(ShareBoxSortType sort, Integer page, Integer size);
}
