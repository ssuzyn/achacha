package com.eurachacha.achacha.domain.user.entity;

import java.util.ArrayList;
import java.util.List;

import com.eurachacha.achacha.domain.gifticon.entity.Gifticon;
import com.eurachacha.achacha.domain.sharebox.entity.Sharebox;
import com.eurachacha.achacha.global.entity.TimeStampEntity;

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
public class User extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	private String provider;

	private String providerUserId;

	private String name;

	private Boolean isDeleted = false;

	@OneToMany(mappedBy = "user")
	private List<Sharebox> sharebox = new ArrayList<>();

	@OneToMany(mappedBy = "user")
	private List<Gifticon> gifticons = new ArrayList<>();

	@Builder
	public User(String provider, String providerUserId, String name) {
		this.provider = provider;
		this.providerUserId = providerUserId;
		this.name = name;
		this.isDeleted = false;
	}

	// 논리 삭제 메서드
	public void delete() {
		this.isDeleted = true;
	}
}
