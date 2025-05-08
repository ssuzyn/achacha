package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.domain.model.brand.QBrand;
import com.eurachacha.achacha.domain.model.gifticon.QGifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.history.QGifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.QUsageHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.eurachacha.achacha.domain.model.sharebox.QParticipation;
import com.eurachacha.achacha.domain.model.sharebox.QShareBox;
import com.eurachacha.achacha.domain.model.user.QUser;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.QueryUtils;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.DateTimeExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GifticonRepositoryCustomImpl implements GifticonRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	// 사용가능 기프티콘 목록 조회
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

		// Projections.fields를 사용한 자동 매핑
		List<AvailableGifticonResponseDto> content = jpaQueryFactory
			.select(Projections.fields(AvailableGifticonResponseDto.class,
				qGifticon.id.as("gifticonId"),
				qGifticon.name.as("gifticonName"),
				qGifticon.type.as("gifticonType"),
				qGifticon.expiryDate.as("gifticonExpiryDate"),
				qBrand.id.as("brandId"),
				qBrand.name.as("brandName"),
				new CaseBuilder()
					.when(qGifticon.sharebox.id.isNull()).then("MY_BOX")
					.otherwise("SHARE_BOX").as("scope"),
				qUser.id.as("userId"),
				qUser.name.as("userName"),
				qGifticon.sharebox.id.as("shareboxId"),
				qShareBox.name.as("shareboxName")
			))
			.from(qGifticon)
			.join(qGifticon.brand, qBrand)
			.join(qGifticon.user, qUser)
			.leftJoin(qGifticon.sharebox, qShareBox)
			.where(
				qGifticon.isDeleted.eq(false),
				qGifticon.isUsed.eq(false),
				qGifticon.remainingAmount.gt(0).or(qGifticon.remainingAmount.isNull()),
				qGifticon.expiryDate.after(LocalDate.now()),
				createScopeCondition(scope, userId, qGifticon, qParticipation),
				typeCondition(type, qGifticon)
			)
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.orderBy(QueryUtils.getOrderSpecifier(pageable.getSort(), qGifticon))
			.fetch();

		boolean hasNext = false;
		if (content.size() > pageable.getPageSize()) {
			content = content.subList(0, pageable.getPageSize());
			hasNext = true;
		}

		return new SliceImpl<>(content, pageable, hasNext);
	}

	@Override
	public Slice<UsedGifticonResponseDto> findUsedGifticons(
		Integer userId,
		GifticonType type,
		Pageable pageable) {

		QGifticon qGifticon = QGifticon.gifticon;
		QBrand qBrand = QBrand.brand;
		QGifticonOwnerHistory qOwnerHistory = QGifticonOwnerHistory.gifticonOwnerHistory;
		QUsageHistory qUsageHistory = QUsageHistory.usageHistory;

		// 사용시간 기준 정렬
		DateTimeExpression<LocalDateTime> usedAtExpr = createUsedAtExpression(qOwnerHistory, qUsageHistory);
		StringExpression usageTypeStrExpr = createTransferTypeExpression(qOwnerHistory);

		List<Tuple> tuples = jpaQueryFactory
			.select(
				qGifticon.id,
				qGifticon.name,
				qGifticon.type,
				qGifticon.expiryDate,
				qBrand.id,
				qBrand.name,
				usageTypeStrExpr,
				usedAtExpr
			)
			.from(qGifticon)
			.join(qGifticon.brand, qBrand)
			.leftJoin(qOwnerHistory)
			.on(qGifticon.id.eq(qOwnerHistory.gifticon.id)
				.and(qOwnerHistory.fromUser.id.eq(userId)))
			.leftJoin(qUsageHistory)
			.on(qGifticon.id.eq(qUsageHistory.gifticon.id)
				.and(qUsageHistory.user.id.eq(userId)))
			.where(
				createUsedGifticonCondition(userId, qGifticon, qOwnerHistory, qUsageHistory),
				qGifticon.isDeleted.eq(false),
				typeCondition(type, qGifticon)
			)
			.groupBy(qGifticon.id, qBrand.id, qOwnerHistory.id, qOwnerHistory.transferType,
				qOwnerHistory.createdAt, qUsageHistory.createdAt)
			.orderBy(usedAtExpr.desc())
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.fetch();

		List<UsedGifticonResponseDto> content = new ArrayList<>();
		for (Tuple tuple : tuples) {
			String usageTypeStr = tuple.get(usageTypeStrExpr);
			UsedGifticonResponseDto dto = UsedGifticonResponseDto.builder()
				.gifticonId(tuple.get(qGifticon.id))
				.gifticonName(tuple.get(qGifticon.name))
				.gifticonType(tuple.get(qGifticon.type))
				.gifticonExpiryDate(tuple.get(qGifticon.expiryDate))
				.brandId(tuple.get(qBrand.id))
				.brandName(tuple.get(qBrand.name))
				.usageType(UsageType.valueOf(usageTypeStr))
				.usedAt(tuple.get(usedAtExpr))
				.thumbnailPath(null)
				.build();
			content.add(dto);
		}

		boolean hasNext = false;
		if (content.size() > pageable.getPageSize()) {
			content = content.subList(0, pageable.getPageSize());
			hasNext = true;
		}

		return new SliceImpl<>(content, pageable, hasNext);
	}

	/**
	 * 범위 타입에 따른 적절한 조건식 선택
	 */
	private BooleanExpression createScopeCondition(GifticonScopeType scope, Integer userId, QGifticon qGifticon,
		QParticipation qParticipation) {
		if (scope == GifticonScopeType.ALL) {
			return createAllScopeCondition(userId, qGifticon, qParticipation);
		} else if (scope == GifticonScopeType.MY_BOX) {
			return createMyBoxScopeCondition(userId, qGifticon);
		} else if (scope == GifticonScopeType.SHARE_BOX) {
			return createShareBoxScopeCondition(userId, qGifticon, qParticipation);
		}
		return null;
	}

	/**
	 * 모든 범위(ALL) 조건 생성
	 */
	private BooleanExpression createAllScopeCondition(Integer userId, QGifticon qGifticon,
		QParticipation qParticipation) {
		return qGifticon.user.id.eq(userId).or(
			qGifticon.sharebox.id.isNotNull().and(
				existsParticipation(userId, qGifticon, qParticipation)
			)
		);
	}

	/**
	 * 내 보관함(MY_BOX) 조건 생성
	 */
	private BooleanExpression createMyBoxScopeCondition(Integer userId, QGifticon qGifticon) {
		return qGifticon.sharebox.id.isNull().and(qGifticon.user.id.eq(userId));
	}

	/**
	 * 공유 보관함(SHARE_BOX) 조건 생성
	 */
	private BooleanExpression createShareBoxScopeCondition(Integer userId, QGifticon qGifticon,
		QParticipation qParticipation) {
		return qGifticon.sharebox.id.isNotNull().and(
			qGifticon.user.id.eq(userId).or(
				existsParticipation(userId, qGifticon, qParticipation)
			)
		);
	}

	/**
	 * 공유박스 참여 확인 서브쿼리
	 */
	private BooleanExpression existsParticipation(Integer userId, QGifticon qGifticon, QParticipation qParticipation) {
		return JPAExpressions
			.selectOne()
			.from(qParticipation)
			.where(
				qParticipation.sharebox.id.eq(qGifticon.sharebox.id),
				qParticipation.user.id.eq(userId)
			)
			.exists();
	}

	/**
	 * 이전 상태에 따른 usageType 표현식 생성
	 * UsedGifticonResponseDto의 생성자에서 문자열을 받아 Enum으로 변환하므로 문자열 반환
	 */
	private StringExpression createTransferTypeExpression(QGifticonOwnerHistory qOwnerHistory) {
		return new CaseBuilder()
			.when(qOwnerHistory.id.isNotNull().and(qOwnerHistory.transferType.eq(TransferType.GIVE_AWAY)))
			.then("GIVE_AWAY")
			.when(qOwnerHistory.id.isNotNull().and(qOwnerHistory.transferType.eq(TransferType.PRESENT)))
			.then("PRESENT")
			.otherwise("SELF_USE");
	}

	/**
	 * 사용 시간 표현식 생성
	 */
	private DateTimeExpression<LocalDateTime> createUsedAtExpression(
		QGifticonOwnerHistory qOwnerHistory, QUsageHistory qUsageHistory) {
		return new CaseBuilder()
			.when(qOwnerHistory.createdAt.isNotNull())
			.then(qOwnerHistory.createdAt)
			.otherwise(qUsageHistory.createdAt);
	}

	/**
	 * 사용된 기프티콘 조건 생성
	 */
	private BooleanExpression createUsedGifticonCondition(
		Integer userId,
		QGifticon qGifticon,
		QGifticonOwnerHistory qOwnerHistory,
		QUsageHistory qUsageHistory) {

		return qOwnerHistory.id.isNotNull()
			.or(qGifticon.user.id.eq(userId).and(qGifticon.isUsed.eq(true)))
			.or(qGifticon.user.id.ne(userId)
				.and(qGifticon.isUsed.eq(true))
				.and(qUsageHistory.id.isNotNull()));
	}

	/**
	 * 기프티콘 타입 조건
	 */
	private BooleanExpression typeCondition(GifticonType type, QGifticon qGifticon) {
		return type == null ? null : qGifticon.type.eq(type);
	}
}
