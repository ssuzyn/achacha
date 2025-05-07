package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.domain.model.brand.QBrand;
import com.eurachacha.achacha.domain.model.gifticon.QGifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.sharebox.QParticipation;
import com.eurachacha.achacha.domain.model.sharebox.QShareBox;
import com.eurachacha.achacha.domain.model.user.QUser;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.QueryUtils;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GifticonRepositoryCustomImpl implements GifticonRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	@Override
	public Slice<AvailableGifticonResponseDto> findAvailableGifticons(
		Integer userId,
		GifticonScopeType scope,
		GifticonType type,
		Pageable pageable) {

		QGifticon qGifticon = QGifticon.gifticon;
		QBrand qBrand = QBrand.brand;
		QUser qUser = QUser.user;
		QShareBox qShareBox = QShareBox.shareBox;
		QParticipation qParticipation = QParticipation.participation;

		// 직접 매핑을 사용
		List<AvailableGifticonResponseDto> content = jpaQueryFactory
			.select(
				qGifticon.id,
				qGifticon.name,
				qGifticon.type,
				qGifticon.expiryDate,
				qBrand.id,
				qBrand.name,
				new CaseBuilder()
					.when(qGifticon.sharebox.id.isNull()).then("MY_BOX")
					.otherwise("SHARE_BOX"),
				qUser.id,
				qUser.name,
				qGifticon.sharebox.id,
				qShareBox.name
			)
			.from(qGifticon)
			.join(qGifticon.brand, qBrand)
			.join(qGifticon.user, qUser)
			.leftJoin(qGifticon.sharebox, qShareBox)
			.where(
				qGifticon.isDeleted.eq(false),
				qGifticon.isUsed.eq(false),
				qGifticon.remainingAmount.gt(0).or(qGifticon.remainingAmount.isNull()),
				qGifticon.expiryDate.after(LocalDate.now()),
				scopeConditionWithUser(scope, userId, qGifticon, qParticipation),
				typeCondition(type, qGifticon)
			)
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.orderBy(QueryUtils.getOrderSpecifier(pageable.getSort(), qGifticon))
			.fetch()
			.stream()
			.map(tuple -> {
				return AvailableGifticonResponseDto.builder()
					.gifticonId(tuple.get(0, Integer.class))
					.gifticonName(tuple.get(1, String.class))
					.gifticonType(tuple.get(2, GifticonType.class))
					.gifticonExpiryDate(tuple.get(3, LocalDate.class))
					.brandId(tuple.get(4, Integer.class))
					.brandName(tuple.get(5, String.class))
					.scope(tuple.get(6, String.class))
					.userId(tuple.get(7, Integer.class))
					.userName(tuple.get(8, String.class))
					.shareboxId(tuple.get(9, Integer.class))
					.shareboxName(tuple.get(10, String.class))
					.build();
			})
			.collect(Collectors.toList());

		boolean hasNext = false;
		if (content.size() > pageable.getPageSize()) {
			content = content.subList(0, pageable.getPageSize());
			hasNext = true;
		}

		return new SliceImpl<>(content, pageable, hasNext);
	}

	/**
	 * 범위 타입과 사용자 ID에 따른 조건식 생성
	 */
	private BooleanExpression scopeConditionWithUser(GifticonScopeType scope, Integer userId, QGifticon g,
		QParticipation p) {
		if (scope == GifticonScopeType.ALL) {
			return g.user.id.eq(userId).or(
				g.sharebox.id.isNotNull().and(
					JPAExpressions
						.selectOne()
						.from(p)
						.where(
							p.sharebox.id.eq(g.sharebox.id),
							p.user.id.eq(userId)
						)
						.exists()
				)
			);
		} else if (scope == GifticonScopeType.MY_BOX) {
			return g.sharebox.id.isNull().and(g.user.id.eq(userId));
		} else if (scope == GifticonScopeType.SHARE_BOX) {
			return g.sharebox.id.isNotNull().and(
				g.user.id.eq(userId).or(
					JPAExpressions
						.selectOne()
						.from(p)
						.where(
							p.sharebox.id.eq(g.sharebox.id),
							p.user.id.eq(userId)
						)
						.exists()
				)
			);
		}
		return null;
	}

	private BooleanExpression typeCondition(GifticonType type, QGifticon g) {
		return type == null ? null : g.type.eq(type);
	}
}
