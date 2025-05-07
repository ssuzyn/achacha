package com.eurachacha.achacha.application.port.output.file;

import java.util.List;
import java.util.Optional;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

public interface FileRepository {
	File save(File file);

	File findFile(Integer referenceEntityId, String referenceEntityType, FileType fileType);

	Optional<File> findByReferenceEntityTypeAndReferenceEntityIdAndType(
		String referenceEntityType, Integer referenceEntityId, FileType type);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityId(
		String referenceEntityType, Integer referenceEntityId);

	void delete(File file);
}
