package com.eurachacha.achacha.application.port.output.user;

import com.eurachacha.achacha.domain.model.user.User;

public interface UserRepository {
	User findById(Integer id);
}
