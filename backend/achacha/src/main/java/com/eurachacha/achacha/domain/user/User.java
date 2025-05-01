package com.eurachacha.achacha.domain.user;

import com.eurachacha.achacha.global.entity.TimeStampEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user")
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
