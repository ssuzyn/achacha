package com.eurachacha.achacha.domain.service.file;

import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

public interface FileDomainService {

	File createFile(String path, FileType type, String referenceEntityType, Integer referenceEntityId);

	void validateImageFile(MultipartFile file);
}
