package com.eurachacha.achacha.application.service.present;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
		// 모든 템플릿 조회
		List<PresentTemplate> templates = presentTemplateRepository.findAll();

		// 템플릿 ID 리스트 추출
		List<Integer> templateIds = templates.stream()
			.map(template -> template.getId().intValue())
			.collect(Collectors.toList());

		// 모든 템플릿의 썸네일 파일을 한 번에 조회
		List<File> thumbnailFiles = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
			"present_template",
			templateIds,
			FileType.PRESENT_THUMBNAIL
		);

		// 파일 맵 생성 (템플릿 ID를 키로 사용)
		Map<Integer, File> fileMap = new HashMap<>();
		for (File file : thumbnailFiles) {
			fileMap.put(file.getReferenceEntityId(), file);
		}

		// 템플릿과 파일 정보를 결합하여 응답 DTO 생성
		return templates.stream()
			.map(template -> {
				Integer templateId = template.getId().intValue();

				// 템플릿 ID에 해당하는 파일 찾기
				File thumbnailFile = fileMap.get(templateId);

				// 파일이 있으면 URL 생성
				String thumbnailUrl = thumbnailFile != null ?
					fileStoragePort.generateFileUrl(thumbnailFile.getPath(), FileType.PRESENT_THUMBNAIL) :
					null;

				// TemplatesResponseDto 생성
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
