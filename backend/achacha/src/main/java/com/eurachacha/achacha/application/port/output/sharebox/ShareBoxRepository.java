package com.eurachacha.achacha.application.port.output.sharebox;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

public interface ShareBoxRepository {
	ShareBox findById(Integer id);

	ShareBox save(ShareBox shareBox);

	boolean existsByInviteCode(String inviteCode);

	// 초대 코드로 쉐어박스 찾기 메서드 추가
	Optional<ShareBox> findByInviteCode(String inviteCode);

	boolean existsById(Integer shareBoxId);

	Slice<ShareBox> findParticipatedShareBoxes(Integer userId, Pageable pageable);
}
