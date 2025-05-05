package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class PageableFactory {

    public Pageable createPageable(Integer page, Integer size, GifticonSortType sort) {

        Sort sortOption = createSortOption(sort);

        return PageRequest.of(page, size, sortOption);
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
