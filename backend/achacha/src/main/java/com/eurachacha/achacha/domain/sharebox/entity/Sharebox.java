package com.eurachacha.achacha.domain.sharebox.entity;

import java.util.ArrayList;
import java.util.List;

import com.eurachacha.achacha.domain.gifticon.entity.Gifticon;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Sharebox extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(length = 32)
	private String name;

	private Boolean allowParticipation = true;

	@Column(length = 32)
	private String inviteCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@OneToMany(mappedBy = "sharebox")
	private List<Gifticon> gifticons = new ArrayList<>();

	@Builder
	public Sharebox(String name, String inviteCode, User user) {
		this.name = name;
		this.inviteCode = inviteCode;
		this.user = user;
		this.allowParticipation = true;
	}
}
