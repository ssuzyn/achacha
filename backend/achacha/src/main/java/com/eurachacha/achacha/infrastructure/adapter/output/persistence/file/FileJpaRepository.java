package com.eurachacha.achacha.infrastructure.adapter.output.persistence.file;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

@Repository
public interface FileJpaRepository extends JpaRepository<File, Integer> {
	@Query("SELECT f FROM File f WHERE f.referenceEntityId = :id AND f.referenceEntityType = :referenceType AND f.type = :type")
	Optional<File> findFile(
		@Param("id") Integer referenceEntityId,
		@Param("referenceType") String referenceEntityType,
		@Param("type") FileType fileType);
}
