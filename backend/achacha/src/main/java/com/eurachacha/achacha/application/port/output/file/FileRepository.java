package com.eurachacha.achacha.application.port.output.file;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

@Repository
public interface FileRepository {
	File save(File file);

	Optional<File> findByReferenceEntityTypeAndReferenceEntityIdAndType(
		String referenceEntityType, Integer referenceEntityId, FileType type);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityId(
		String referenceEntityType, Integer referenceEntityId);

	void delete(File file);
}
