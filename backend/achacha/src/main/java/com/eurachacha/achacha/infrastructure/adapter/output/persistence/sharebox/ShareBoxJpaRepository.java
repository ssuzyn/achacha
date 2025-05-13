package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

@Repository
public interface ShareBoxJpaRepository extends JpaRepository<ShareBox, Integer>, ShareBoxRepositoryCustom {
	boolean existsByInviteCode(String inviteCode);

	Optional<ShareBox> findByInviteCode(String inviteCode);
}
