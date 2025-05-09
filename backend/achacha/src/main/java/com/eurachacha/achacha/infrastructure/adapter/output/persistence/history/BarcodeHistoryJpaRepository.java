package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.history.BarcodeHistory;

@Repository
public interface BarcodeHistoryJpaRepository extends JpaRepository<BarcodeHistory, Integer> {
}
