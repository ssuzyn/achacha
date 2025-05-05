package com.eurachacha.achacha.web.gifticon;

import com.eurachacha.achacha.application.port.input.gifticon.AvailableGifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/available-gifticons")
@RestController
@RequiredArgsConstructor
public class AvailableGifticonController {

    private final AvailableGifticonAppService availableGifticonAppService;

    @GetMapping
    public ResponseEntity<AvailableGifticonsResponseDto> getAvailableGifticons(
            @RequestParam(required = false, defaultValue = "ALL") GifticonScopeType scope,
            @RequestParam(required = false) GifticonType type,
            @RequestParam(required = false, defaultValue = "CREATED_DESC") GifticonSortType sort,
            @RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) Integer size) {
        return ResponseEntity.ok(availableGifticonAppService.getAvailableGifticons(scope, type, sort, page, size));
    }

    @GetMapping("/{gifticonId}")
    public ResponseEntity<?> getAvailableGifticon(
            @PathVariable Integer gifticonId
    ) {
        return ResponseEntity.ok(availableGifticonAppService.getAvailableGifticonDetail(gifticonId));
    }
}
