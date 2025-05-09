package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.history.BarcodeHistoryRepository;
import com.eurachacha.achacha.domain.model.history.BarcodeHistory;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BarcodeHistoryPersistenceAdapter implements BarcodeHistoryRepository {

	private final BarcodeHistoryJpaRepository barcodeHistoryJpaRepository;

	@Override
	public BarcodeHistory saveBarcodeHistory(BarcodeHistory barcodeHistory) {
		return barcodeHistoryJpaRepository.save(barcodeHistory);
	}
}
