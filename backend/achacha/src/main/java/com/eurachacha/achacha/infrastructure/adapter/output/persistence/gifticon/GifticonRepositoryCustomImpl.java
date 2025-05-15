package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.domain.model.brand.QBrand;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
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
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.DateTimeExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GifticonRepositoryCustomImpl implements GifticonRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	@Override
	public Slice<Gifticon> findAvailableGifticons(Integer userId, GifticonScopeType scope, GifticonType type,
		Pageable pageable) {

		QGifticon qGifticon = QGifticon.gifticon;
		QBrand qBrand = QBrand.brand;
		QUser qUser = QUser.user;
		QShareBox qShareBox = QShareBox.shareBox;
		QParticipation qParticipation = QParticipation.participation;

		List<Gifticon> content = jpaQueryFactory
			.selectFrom(qGifticon)
			.join(qGifticon.brand, qBrand).fetchJoin()
			.join(qGifticon.user, qUser).fetchJoin()
			.leftJoin(qGifticon.sharebox, qShareBox).fetchJoin()
			.where(
				qGifticon.isUsed.eq(false),
				scopeCondition(scope, userId, qGifticon, qParticipation),
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
		QGifticonOwnerHistory qOwner = QGifticonOwnerHistory.gifticonOwnerHistory;
		QUsageHistory qUsage = QUsageHistory.usageHistory;

		// 1) usageHistory 중 MAX(createdAt) aggregation
		DateTimeExpression<LocalDateTime> maxUsageTime = qUsage.createdAt.max();

		// 2) CASE: 소유권 이력(createdAt) 있으면 그것, 없으면 maxUsageTime
		DateTimeExpression<LocalDateTime> usedAtExpr = Expressions.cases()
			.when(qOwner.id.isNotNull()).then(qOwner.createdAt)
			.otherwise(maxUsageTime);

		// usageType 표현식은 그대로
		StringExpression usageTypeStrExpr = createTransferTypeExpression(qOwner);

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
			.leftJoin(qOwner)
			.on(qGifticon.id.eq(qOwner.gifticon.id)
				.and(qOwner.fromUser.id.eq(userId)))
			.leftJoin(qUsage)
			.on(qGifticon.id.eq(qUsage.gifticon.id)
				.and(qUsage.user.id.eq(userId)))
			.where(
				createUsedGifticonCondition(userId, qGifticon, qOwner, qUsage),
				qGifticon.isDeleted.eq(false),
				typeCondition(type, qGifticon)
			)
			// 그룹핑에 owner.createdAt과 MAX(createdAt) aggregate를 뺄 수 없으니
			// owner.id, owner.transferType, owner.createdAt 만 groupBy
			.groupBy(
				qGifticon.id,
				qBrand.id,
				qOwner.id,
				qOwner.transferType,
				qOwner.createdAt
			)
			.orderBy(usedAtExpr.desc())
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.fetch();

		// DTO 매핑, Slice 처리 로직은 그대로
		List<UsedGifticonResponseDto> content = tuples.stream()
			.map(tuple -> UsedGifticonResponseDto.builder()
				.gifticonId(tuple.get(qGifticon.id))
				.gifticonName(tuple.get(qGifticon.name))
				.gifticonType(tuple.get(qGifticon.type))
				.gifticonExpiryDate(tuple.get(qGifticon.expiryDate))
				.brandId(tuple.get(qBrand.id))
				.brandName(tuple.get(qBrand.name))
				.usageType(UsageType.valueOf(tuple.get(usageTypeStrExpr)))
				.usedAt(tuple.get(usedAtExpr))
				.thumbnailPath(null)
				.build()
			).toList();

		boolean hasNext = content.size() > pageable.getPageSize();
		if (hasNext)
			content = content.subList(0, pageable.getPageSize());

		return new SliceImpl<>(content, pageable, hasNext);
	}

	// 쉐어박스 내 기프티콘 조회
	@Override
	public Slice<Gifticon> findGifticonsByShareBoxId(
		Integer shareBoxId,
		GifticonType type,
		Pageable pageable) {

		QGifticon qGifticon = QGifticon.gifticon;
		QBrand qBrand = QBrand.brand;
		QUser qUser = QUser.user;
		QShareBox qShareBox = QShareBox.shareBox;

		// 메인 쿼리 실행
		List<Gifticon> gifticons = jpaQueryFactory
			.selectFrom(qGifticon)
			.join(qGifticon.brand, qBrand).fetchJoin()
			.join(qGifticon.user, qUser).fetchJoin()
			.join(qGifticon.sharebox, qShareBox).fetchJoin()
			.where(
				qGifticon.sharebox.id.eq(shareBoxId),
				qGifticon.isDeleted.eq(false),
				qGifticon.isUsed.eq(false),
				typeCondition(type, qGifticon)
			)
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.orderBy(QueryUtils.getOrderSpecifier(pageable.getSort(), qGifticon))
			.fetch();

		boolean hasNext = false;
		if (gifticons.size() > pageable.getPageSize()) {
			gifticons = gifticons.subList(0, pageable.getPageSize());
			hasNext = true;
		}

		return new SliceImpl<>(gifticons, pageable, hasNext);
	}

	@Override
	public Slice<Gifticon> findUsedGifticonsByShareBoxId(
		Integer shareBoxId,
		GifticonType type,
		Pageable pageable) {

		QGifticon qGifticon = QGifticon.gifticon;
		QBrand qBrand = QBrand.brand;
		QUser qUser = QUser.user;
		QShareBox qShareBox = QShareBox.shareBox;

		OrderSpecifier<LocalDateTime> orderBy = qGifticon.updatedAt.desc();

		// 메인 쿼리 실행
		List<Gifticon> gifticons = jpaQueryFactory
			.selectFrom(qGifticon)
			.join(qGifticon.brand, qBrand).fetchJoin()
			.join(qGifticon.user, qUser).fetchJoin()
			.join(qGifticon.sharebox, qShareBox).fetchJoin()
			.where(
				qGifticon.sharebox.id.eq(shareBoxId),
				qGifticon.isDeleted.eq(false),
				qGifticon.isUsed.eq(true),  // 사용된 기프티콘만 조회
				typeCondition(type, qGifticon)
			)
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.orderBy(orderBy)
			.fetch();

		boolean hasNext = false;
		if (gifticons.size() > pageable.getPageSize()) {
			gifticons = gifticons.subList(0, pageable.getPageSize());
			hasNext = true;
		}

		return new SliceImpl<>(gifticons, pageable, hasNext);
	}

	// 쉐어박스 목록의 사용가능한 기프티콘 갯수 조회
	@Override
	public Map<Integer, Long> countGifticonsByShareBoxIds(List<Integer> shareBoxIds) {
		if (shareBoxIds.isEmpty()) {
			return Collections.emptyMap();
		}

		QGifticon qGifticon = QGifticon.gifticon;

		List<Tuple> results = jpaQueryFactory
			.select(qGifticon.sharebox.id, qGifticon.count())
			.from(qGifticon)
			.where(
				qGifticon.sharebox.id.in(shareBoxIds),
				qGifticon.isDeleted.eq(false),
				qGifticon.isUsed.eq(false)
			)
			.groupBy(qGifticon.sharebox.id)
			.fetch();

		return results.stream()
			.collect(Collectors.toMap(
				tuple -> tuple.get(qGifticon.sharebox.id),
				tuple -> tuple.get(qGifticon.count())
			));
	}

	/**
	 * 범위 타입에 따른 적절한 조건식 선택
	 */
	private BooleanExpression scopeCondition(GifticonScopeType scope, Integer userId, QGifticon qGifticon,
		QParticipation qParticipation) {
		if (scope == GifticonScopeType.ALL) {
			return allScopeCondition(userId, qGifticon, qParticipation);
		} else if (scope == GifticonScopeType.MY_BOX) {
			return myBoxScopeCondition(userId, qGifticon);
		} else if (scope == GifticonScopeType.SHARE_BOX) {
			return shareBoxScopeCondition(userId, qGifticon, qParticipation);
		}
		return null;
	}

	/**
	 * 모든 범위(ALL) 조건 생성
	 */
	private BooleanExpression allScopeCondition(Integer userId, QGifticon qGifticon,
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
	private BooleanExpression myBoxScopeCondition(Integer userId, QGifticon qGifticon) {
		return qGifticon.sharebox.id.isNull().and(qGifticon.user.id.eq(userId));
	}

	/**
	 * 공유 보관함(SHARE_BOX) 조건 생성
	 */
	private BooleanExpression shareBoxScopeCondition(Integer userId, QGifticon qGifticon,
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
