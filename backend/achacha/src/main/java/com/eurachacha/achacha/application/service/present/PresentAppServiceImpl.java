package com.eurachacha.achacha.application.service.present;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.present.PresentAppService;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.TemplatesResponseDto;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PresentAppServiceImpl implements PresentAppService {

	private final PresentTemplateRepository presentTemplateRepository;
	private final ColorPaletteRepository colorPaletteRepository;
	private final FileRepository fileRepository;
	private final FileStoragePort fileStoragePort;

	@Override
	public List<TemplatesResponseDto> getTemplates() {
		List<PresentTemplate> templates = presentTemplateRepository.findAll();

		return templates.stream()
			.map(template -> {
				Integer templateId = template.getId().intValue();

				// 현재 템플릿에 대응하는 파일 찾기
				Optional<File> thumbnailFile = fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(
					"present_template",
					templateId,
					FileType.PRESENT_THUMBNAIL
				);

				// 파일이 있으면 URL 생성
				String thumbnailUrl = thumbnailFile
					.map(file -> fileStoragePort.generateFileUrl(file.getPath(), FileType.PRESENT_THUMBNAIL))
					.orElse(null);

				return TemplatesResponseDto.builder()
					.presentTemplateId(templateId)
					.presentTemplateCategory(template.getCategory().name())
					.thumbnailPath(thumbnailUrl)
					.build();
			})
			.collect(Collectors.toList());
	}

	@Override
	public List<ColorInfoResponseDto> getColors(Integer templateId) {
		List<ColorPalette> colorPalettes = colorPaletteRepository.findByPresentTemplateId(templateId);

		return colorPalettes.stream()
			.map(colorPalette -> ColorInfoResponseDto.builder()
				.colorPaletteId(colorPalette.getId().intValue())
				.colorPaletteCode(colorPalette.getCode())
				.presentTemplateId(templateId)
				.build())
			.collect(Collectors.toList());
	}
}
