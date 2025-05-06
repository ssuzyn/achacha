package com.eurachacha.achacha.domain.service.file;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileDomainServiceImpl implements FileDomainService {

	@Override
	public File createFile(String path, FileType type, String referenceEntityType, Integer referenceEntityId) {
		return File.builder()
			.path(path)
			.type(type)
			.referenceEntityType(referenceEntityType)
			.referenceEntityId(referenceEntityId)
			.build();
	}
}
