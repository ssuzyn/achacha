package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedGifticonResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private GifticonType gifticonType;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate gifticonExpiryDate;
	private Integer brandId;
	private String brandName;
	private UsageType usageType;
	private LocalDateTime usedAt;
	private String thumbnailPath;

	public UsedGifticonResponseDto(
		Integer gifticonId,
		String gifticonName,
		GifticonType gifticonType,
		LocalDate gifticonExpiryDate,
		Integer brandId,
		String brandName,
		String usageTypeStr,  // 문자열로 받음
		LocalDateTime usedAt,
		String thumbnailPath
	) {
		this.gifticonId = gifticonId;
		this.gifticonName = gifticonName;
		this.gifticonType = gifticonType;
		this.gifticonExpiryDate = gifticonExpiryDate;
		this.brandId = brandId;
		this.brandName = brandName;
		this.usageType = UsageType.valueOf(usageTypeStr);  // 문자열을 ENUM으로 변환
		this.usedAt = usedAt;
		this.thumbnailPath = thumbnailPath;
	}
}
