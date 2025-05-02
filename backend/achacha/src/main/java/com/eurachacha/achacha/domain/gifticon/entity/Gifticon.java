package com.eurachacha.achacha.domain.gifticon.entity;

import java.time.LocalDate;

import org.hibernate.annotations.ColumnDefault;

import com.eurachacha.achacha.domain.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.sharebox.entity.Sharebox;
import com.eurachacha.achacha.domain.user.entity.User;
import com.eurachacha.achacha.global.entity.TimeStampEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Gifticon extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(length = 64)
	private String name;

	private GifticonType type;

	@Column(length = 32)
	private String barcode;

	@ColumnDefault("-1")
	private Integer originalAmount;

	@ColumnDefault("-1")
	private Integer remainingAmount;

	private LocalDate expireDate;

	private Boolean isUsed = false;

	private Boolean isDeleted = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sharebox_id")
	private Sharebox sharebox;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "brand_id")
	private Brand brand;

	@Builder
	public Gifticon(String name, GifticonType type, String barcode, Integer originalAmount, Integer remainingAmount,
		LocalDate expireDate, User user, Sharebox sharebox, Brand brand) {
		this.name = name;
		this.type = type;
		this.barcode = barcode;
		this.originalAmount = originalAmount;
		this.remainingAmount = remainingAmount;
		this.expireDate = expireDate;
		this.user = user;
		this.sharebox = sharebox;
		this.brand = brand;
		this.isUsed = false;
		this.isDeleted = false;
	}

	// 사용 메서드
	public void use() {
		this.isUsed = true;
	}

	// 논리 삭제 메서드
	public void delete() {
		this.isDeleted = true;
	}
}
