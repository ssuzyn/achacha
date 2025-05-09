package com.eurachacha.achacha.application.port.output.sharebox;

import com.eurachacha.achacha.domain.model.sharebox.Participation;

public interface ParticipationRepository {
	boolean checkParticipation(Integer userId, Integer shareBoxId);

	Participation save(Participation participation);
}
