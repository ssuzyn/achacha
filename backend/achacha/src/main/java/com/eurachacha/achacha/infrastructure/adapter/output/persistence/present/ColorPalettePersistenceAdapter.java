package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ColorPalettePersistenceAdapter implements ColorPaletteRepository {

	private final ColorPaletteJpaRepository colorPaletteJpaRepository;

	@Override
	public List<ColorPalette> findByPresentTemplateId(Integer templateId) {
		List<ColorPalette> colorPalettes = colorPaletteJpaRepository.findByPresentTemplateId(templateId);
		if(colorPalettes.isEmpty()){
			throw new CustomException(ErrorCode.COLOR_NOT_FOUND);
		}
		return colorPalettes;
	}
}
