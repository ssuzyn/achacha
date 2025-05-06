package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;

@Component
public class PageableFactory {

	// 사용 가능
	public Pageable createPageable(Integer page, Integer size, GifticonSortType sort) {

		Sort sortOption = createSortOption(sort);

		return PageRequest.of(page, size, sortOption);
	}

	// 사용 가능
	private Sort createSortOption(GifticonSortType sort) {
		return switch (sort) {
			case EXPIRY_ASC -> Sort.by("expiryDate").ascending().and(Sort.by("id").ascending());
			case CREATED_DESC -> Sort.by("createdAt").descending();
		};
	}

	// 사용 완료
	public Pageable createPageable(Integer page, Integer size, GifticonUsedSortType sort) {
		Sort sortOption = createSortOption(sort);

		return PageRequest.of(page, size, sortOption);
	}

	// 사용 완료
	private Sort createSortOption(GifticonUsedSortType sort) {
		return switch (sort) {
			case USED_DESC -> Sort.by("usedAt").descending();
		};
	}
}
