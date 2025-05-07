package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

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
	public ShareBox findById(Integer id) {
		return shareBoxJpaRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR));
	}
}
