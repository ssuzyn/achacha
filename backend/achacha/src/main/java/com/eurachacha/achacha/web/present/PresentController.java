package com.eurachacha.achacha.web.present;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.present.PresentAppService;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/present-templates")
@RestController
@RequiredArgsConstructor
public class PresentController {

	private final PresentAppService presentAppService;

	@GetMapping("/{presentTemplateId}/colors")
	public ResponseEntity<List<ColorInfoResponseDto>> getColors(@PathVariable Integer presentTemplateId) {
		return ResponseEntity.ok().body(presentAppService.getColors(presentTemplateId));
	}

}
