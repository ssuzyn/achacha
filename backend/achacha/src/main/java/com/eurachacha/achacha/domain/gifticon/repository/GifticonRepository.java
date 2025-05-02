package com.eurachacha.achacha.domain.gifticon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.gifticon.entity.Gifticon;

@Repository
public interface GifticonRepository extends JpaRepository<Gifticon, Integer> {
}
