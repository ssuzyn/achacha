package com.eurachacha.achacha.domain.gifticon.service;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.gifticon.entity.Gifticon;
import com.eurachacha.achacha.domain.gifticon.repository.GifticonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GifticonServiceImpl implements GifticonService {

	private final GifticonRepository gifticonRepository;

	public Gifticon saveGifticon(Gifticon gifticon) { // 임시용
		return gifticonRepository.save(gifticon);
	}
}
