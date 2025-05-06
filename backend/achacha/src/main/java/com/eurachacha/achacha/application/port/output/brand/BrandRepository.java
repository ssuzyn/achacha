package com.eurachacha.achacha.application.port.output.brand;

import java.util.List;

import com.eurachacha.achacha.domain.model.brand.Brand;

public interface BrandRepository {
	List<Brand> findByNameContaining(String keyword);
}
