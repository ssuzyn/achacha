package com.eurachacha.achacha.infrastructure.adapter.output.persistence.brand;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.domain.model.brand.Brand;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class BrandPersistenceAdapter implements BrandRepository {

	private final BrandJpaRepository brandJpaRepository;

	@Override
	public List<Brand> findByNameContaining(String keyword) {
		return brandJpaRepository.findByNameContainingIgnoreCaseOrderByNameAsc(keyword);
	}
}
