package com.eurachacha.achacha.domain.gifticon.entity;

import java.util.ArrayList;
import java.util.List;

import com.eurachacha.achacha.global.entity.TimeStampEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Brand extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(length = 64)
	private String name;

	@OneToMany(mappedBy = "brand")
	private List<Gifticon> gifticons = new ArrayList<>();

	@Builder
	public Brand(String name) {
		this.name = name;
	}
}
