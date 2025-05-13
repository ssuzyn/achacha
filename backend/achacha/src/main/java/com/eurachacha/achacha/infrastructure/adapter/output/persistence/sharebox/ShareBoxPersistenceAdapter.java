package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ShareBoxPersistenceAdapter implements ShareBoxRepository {

	private final ShareBoxJpaRepository shareBoxJpaRepository;

	@Override
	public ShareBox save(ShareBox shareBox) {
		return shareBoxJpaRepository.save(shareBox);
	}

	@Override
	public boolean existsByInviteCode(String inviteCode) {
		return shareBoxJpaRepository.existsByInviteCode(inviteCode);
	}

	@Override
	public ShareBox findById(Integer id) {
		return shareBoxJpaRepository.findByIdWithUser(id)
			.orElseThrow(() -> new CustomException(ErrorCode.SHAREBOX_NOT_FOUND));
	}

	@Override
	public Optional<ShareBox> findByInviteCode(String inviteCode) {
		return shareBoxJpaRepository.findByInviteCode(inviteCode);
	}

	@Override
	public boolean existsById(Integer shareBoxId) {
		return shareBoxJpaRepository.existsById(shareBoxId);
	}
}
