package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PresentTemplatePersistenceAdapter implements PresentTemplateRepository {

	private final PresentTemplateJpaRepository presentTemplateJpaRepository;

	@Override
	public List<PresentTemplate> findAll() {
		return presentTemplateJpaRepository.findAll();
	}
}
