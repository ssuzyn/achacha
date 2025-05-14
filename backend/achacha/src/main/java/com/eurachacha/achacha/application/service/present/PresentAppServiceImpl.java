package com.eurachacha.achacha.application.service.present;

import java.awt.*;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.present.PresentAppService;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;
import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.domain.model.present.ColorPalette;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PresentAppServiceImpl implements PresentAppService {

	private final ColorPaletteRepository colorPaletteRepository;

	@Override
	public List<ColorInfoResponseDto> getColors(Integer presentTemplateId) {
		List<ColorPalette> colorPalettes = colorPaletteRepository.findByPresentTemplateId(presentTemplateId);

		return colorPalettes.stream()
			.map(colorPalette -> ColorInfoResponseDto.builder()
				.colorId(colorPalette.getId().intValue())
				.colorCode(colorPalette.getCode())
				.presentTemplateId(presentTemplateId)
				.build())
			.collect(Collectors.toList());
	}
}
