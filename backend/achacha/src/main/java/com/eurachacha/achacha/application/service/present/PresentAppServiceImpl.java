package com.eurachacha.achacha.application.service.present;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.present.PresentAppService;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorCardInfoDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.TemplateDetailResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.TemplatesResponseDto;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;
import com.eurachacha.achacha.domain.model.present.enums.TemplateCategory;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

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
	@Transactional(readOnly = true)
	public TemplateDetailResponseDto getTemplateDetail(Integer templateId) {
		// 1. 템플릿 정보 조회
		PresentTemplate template = presentTemplateRepository.findById(templateId);

		// 2. 템플릿 카테고리와 ID로 기본 DTO 빌더 생성
		TemplateDetailResponseDto.TemplateDetailResponseDtoBuilder builder = TemplateDetailResponseDto.builder()
			.presentTemplateId(templateId)
			.presentTemplateCategory(template.getCategory().name());

		// 3. 템플릿 타입에 따라 다른 필드 추가
		if (template.getCategory() == TemplateCategory.GENERAL) {
			// GENERAL 템플릿의 경우 - 색상별 카드 이미지 정보 추가
			List<ColorPalette> colorPalettes = colorPaletteRepository.findByPresentTemplateId(templateId);

			// 모든 색상 팔레트 ID 추출
			List<Integer> colorPaletteIds = colorPalettes.stream()
				.map(colorPalette -> colorPalette.getId().intValue())
				.collect(Collectors.toList());

			// 모든 색상 팔레트에 대한 카드 이미지를 한 번에 조회
			List<File> cardFiles = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
				"color_palette",
				colorPaletteIds,
				FileType.PRESENT_CARD
			);

			// 파일 맵 생성 (색상 팔레트 ID를 키로 사용)
			Map<Integer, File> fileMap = cardFiles.stream()
				.collect(Collectors.toMap(
					File::getReferenceEntityId,
					file -> file
				));

			// 각 색상 팔레트별 DTO 생성
			List<ColorCardInfoDto> colorCards = colorPalettes.stream()
				.map(colorPalette -> {
					Integer colorPaletteId = colorPalette.getId().intValue();
					File cardFile = fileMap.get(colorPaletteId);

					String cardImageUrl = cardFile != null ?
						fileStoragePort.generateFileUrl(cardFile.getPath(), FileType.PRESENT_CARD) :
						null;

					return ColorCardInfoDto.builder()
						.colorPaletteId(colorPaletteId)
						.cardImagePath(cardImageUrl)
						.build();
				})
				.collect(Collectors.toList());

			builder.colorCards(colorCards);
		} else {
			// 일반 템플릿의 경우 - 단일 카드 이미지 경로 추가
			Optional<File> cardImageFile = fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(
				"present_template",
				templateId,
				FileType.PRESENT_CARD
			);

			String cardImageUrl = cardImageFile
				.map(file -> fileStoragePort.generateFileUrl(file.getPath(), FileType.PRESENT_CARD))
				.orElse(null);

			builder.cardImagePath(cardImageUrl);
		}

		// 4. 완성된 DTO 반환
		return builder.build();
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
