package com.eurachacha.achacha.application.port.output.sharebox;

import com.eurachacha.achacha.domain.model.sharebox.Participation;

public interface ParticipationRepository {
	Participation checkParticipation(Integer userId, Integer shareBoxId);

}
