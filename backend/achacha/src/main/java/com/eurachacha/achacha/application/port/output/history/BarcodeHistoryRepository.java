package com.eurachacha.achacha.application.port.output.history;

import com.eurachacha.achacha.domain.model.history.BarcodeHistory;

public interface BarcodeHistoryRepository {
	BarcodeHistory saveBarcodeHistory(BarcodeHistory barcodeHistory);
}
