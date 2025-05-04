package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class PageableFactory {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE_NUMBER = 0;

    public Pageable createPageable(Integer page, Integer size, GifticonSortType sort) {
        int pageNumber = page != null ? page : DEFAULT_PAGE_NUMBER;
        int pageSize = size != null ? size : DEFAULT_PAGE_SIZE;

        Sort sortOption = createSortOption(sort);

        return PageRequest.of(pageNumber, pageSize, sortOption);
    }

    private Sort createSortOption(GifticonSortType sort) {
        if (sort == null) {
            return Sort.by("id").descending();
        }

        return switch (sort) {
            case EXPIRY_ASC -> Sort.by("expiryDate").ascending().and(Sort.by("id").ascending());
            case CREATED_DESC -> Sort.by("id").descending();
        };
    }
}
