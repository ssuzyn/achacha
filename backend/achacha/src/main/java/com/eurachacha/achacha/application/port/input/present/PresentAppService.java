package com.eurachacha.achacha.application.port.input.present;

import java.util.List;

import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;

public interface PresentAppService {

	List<ColorInfoResponseDto> getColors(Integer presentTemplateId);
}
