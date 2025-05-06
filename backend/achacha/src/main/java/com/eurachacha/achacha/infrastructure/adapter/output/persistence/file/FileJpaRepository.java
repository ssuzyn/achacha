package com.eurachacha.achacha.infrastructure.adapter.output.persistence.file;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

public interface FileJpaRepository extends JpaRepository<File, Long> {

	Optional<File> findByReferenceEntityTypeAndReferenceEntityIdAndType(
		String referenceEntityType, Integer referenceEntityId, FileType type);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityId(
		String referenceEntityType, Integer referenceEntityId);
}
