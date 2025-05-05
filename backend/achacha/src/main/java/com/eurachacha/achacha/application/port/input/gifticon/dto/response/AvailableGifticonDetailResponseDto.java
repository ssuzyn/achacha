package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableGifticonDetailResponseDto {
    private Integer gifticonId;
    private String gifticonName;
    private GifticonType gifticonType;
    private LocalDate gifticonExpiryDate;
    private Integer brandId;
    private String brandName;
    private String scope; // MY_BOX or SHARE_BOX
    private Integer userId;
    private String userName;
    private Integer shareBoxId;
    private String shareBoxName;
    private String thumbnailPath;
    private String originalImagePath;
    private LocalDateTime gifticonCreatedAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer gifticonOriginalAmount;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer gifticonRemainingAmount;
}
