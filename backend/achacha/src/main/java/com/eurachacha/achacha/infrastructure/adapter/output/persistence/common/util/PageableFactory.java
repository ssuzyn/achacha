package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
import com.eurachacha.achacha.domain.model.sharebox.enums.ShareBoxSortType;

@Component
public class PageableFactory {

	// 사용 가능 기프티콘
	public Pageable createPageable(Integer page, Integer size, GifticonSortType sort) {

		Sort sortOption = createSortOption(sort);

		return PageRequest.of(page, size, sortOption);
	}

	// 사용 가능 기프티콘
	private Sort createSortOption(GifticonSortType sort) {
		return switch (sort) {
			case EXPIRY_ASC -> Sort.by("expiryDate").ascending().and(Sort.by("id").ascending());
			case CREATED_DESC -> Sort.by("createdAt").descending();
		};
	}

	// 사용 완료 기프티콘
	public Pageable createPageable(Integer page, Integer size, GifticonUsedSortType sort) {
		Sort sortOption = createSortOption(sort);

		return PageRequest.of(page, size, sortOption);
	}

	// 사용 완료 기프티콘
	private Sort createSortOption(GifticonUsedSortType sort) {
		return switch (sort) {
			case USED_DESC -> Sort.by("usedAt").descending();
		};
	}

	// 쉐어박스
	public Pageable createPageable(Integer page, Integer size, ShareBoxSortType sort) {
		Sort sortOption = createSortOption(sort);
		return PageRequest.of(page, size, sortOption);
	}

	// 쉐어박스
	private Sort createSortOption(ShareBoxSortType sort) {
		return switch (sort) {
			case CREATED_DESC -> Sort.by("createdAt").descending();
			case NAME_ASC -> Sort.by("name").ascending();
		};
	}
}
