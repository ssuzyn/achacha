package com.eurachacha.achacha.domain.model.present;

import com.eurachacha.achacha.domain.model.common.TimeStampEntity;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
public class PresentCard extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(length = 20, nullable = false)
	private String code;

	@Column(length = 100, nullable = false)
	private String message;

	@NotNull
	private LocalDateTime expiryDateTime;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@OneToOne
	@JoinColumn(name = "gifticon_id", nullable = false)
	private Gifticon gifticon;

	@ManyToOne
	@JoinColumn(name = "present_template_id", nullable = false)
	private PresentTemplate presentTemplate;

	@ManyToOne
	@JoinColumn(name = "color_palette_id")
	private ColorPalette colorPalette;

	@PrePersist
	public void prePersist() {
		// 생성 시 자동으로 만료 시간을 24시간 후로 설정
		if (expiryDateTime == null) {
			// TimeStampEntity에서 상속받은 createdAt은 아직 설정되지 않았으므로
			// 현재 시간을 기준으로 24시간 후로 설정
			expiryDateTime = LocalDateTime.now().plusHours(24);
		}
	}
}