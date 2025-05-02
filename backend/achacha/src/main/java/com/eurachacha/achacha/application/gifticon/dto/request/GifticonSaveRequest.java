package com.eurachacha.achacha.application.gifticon.dto.request;

import java.time.LocalDate;

import com.eurachacha.achacha.domain.gifticon.enums.GifticonType;

import lombok.Builder;
import lombok.Getter;

@Getter
public class GifticonSaveRequest { // 임시용
	private String name;
	private GifticonType type;
	private String barcode;
	private Integer originalAmount;
	private LocalDate expireDate;

	@Builder
	public GifticonSaveRequest(String name, GifticonType type, String barcode, Integer originalAmount, LocalDate expireDate) {
		this.name = name;
		this.type = type;
		this.barcode = barcode;
		this.originalAmount = originalAmount;
		this.expireDate = expireDate;
	}
}
