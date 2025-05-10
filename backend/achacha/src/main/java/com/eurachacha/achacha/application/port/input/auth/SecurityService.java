package com.eurachacha.achacha.application.port.input.auth;

import com.eurachacha.achacha.domain.model.user.User;

public interface SecurityService {
	boolean isLoggedIn();

	User getLoggedInUser();
}
