package com.eurachacha.achacha.application.port.input.gifticon.dto.request;

import java.time.LocalDate;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GifticonSaveRequestDto {
	private String name;
	private GifticonType type;
	private String barcode;
	private Integer originalAmount;
	private LocalDate expiryDate;
}
