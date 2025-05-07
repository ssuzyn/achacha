package com.eurachacha.achacha.infrastructure.adapter.output.persistence.file;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FilePersistenceAdapter implements FileRepository {

	private final FileJpaRepository fileJpaRepository;

	@Override
	public File findFile(Integer referenceEntityId, String referenceEntityType, FileType fileType) {
		return fileJpaRepository.findFile(referenceEntityId, referenceEntityType, fileType)
			.orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR));
	}
}
