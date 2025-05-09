package com.eurachacha.achacha.application.port.output.sharebox;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

public interface ShareBoxRepository {
	ShareBox findById(Integer id);

	ShareBox save(ShareBox shareBox);

	boolean existsByInviteCode(String inviteCode);
}
