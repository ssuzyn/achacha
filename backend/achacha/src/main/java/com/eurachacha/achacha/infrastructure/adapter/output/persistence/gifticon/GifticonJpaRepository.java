package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

@Repository
public interface GifticonJpaRepository extends JpaRepository<Gifticon, Integer> {
}
