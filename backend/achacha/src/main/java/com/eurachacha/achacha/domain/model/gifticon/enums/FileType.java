package com.eurachacha.achacha.domain.model.gifticon.enums;

import lombok.Getter;

@Getter
public enum FileType {
	ORIGINAL("images/gifticons/original"),
	THUMBNAIL("images/gifticons/thumbnail"),
	BARCODE("images/gifticons/barcode");

	private final String pathPrefix;

	FileType(String pathPrefix) {
		this.pathPrefix = pathPrefix;
	}
}
