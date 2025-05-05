package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

@Repository
public interface AvailableGifticonJpaRepository extends JpaRepository<Gifticon, Integer> {

	@Query("""
		SELECT new com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto(
		      g.id,
		      g.name,
		      g.type,
		      g.expiryDate,
		      b.id,
		      b.name,
		      CASE WHEN g.sharebox.id IS NULL THEN 'MY_BOX' ELSE 'SHARE_BOX' END,
		      u.id,
		      u.name,
		      g.sharebox.id,
		      sb.name,
		      (
		        SELECT f.path
		          FROM File f
		         WHERE f.referenceEntityType = 'GIFTICON'
		           AND f.referenceEntityId = g.id
		           AND f.type = :fileType
		           AND f.id = (
		             SELECT MIN(f2.id)
		               FROM File f2
		              WHERE f2.referenceEntityType = 'GIFTICON'
		                AND f2.referenceEntityId = g.id
		                AND f2.type = :fileType
		           )
		      )
		  )
		  FROM Gifticon g
		  JOIN g.brand b
		  JOIN g.user u
		  LEFT JOIN g.sharebox sb
		  WHERE g.isDeleted = false
		    AND g.isUsed = false
		    AND (g.remainingAmount > 0 OR g.remainingAmount = -1)
		    AND g.expiryDate > CURRENT_DATE
		    AND g.user.id = :userId
		    AND (
		      :#{#scope.name()} = 'ALL'
		      OR (:#{#scope.name()} = 'MY_BOX'   AND g.sharebox.id IS NULL)
		      OR (:#{#scope.name()} = 'SHARE_BOX' AND g.sharebox.id IS NOT NULL)
		    )
		    AND (:type IS NULL OR g.type = :type)
		""")
	Slice<AvailableGifticonResponseDto> findAvailableGifticons(
		@Param("userId") Integer userId,
		@Param("scope") GifticonScopeType scope,
		@Param("type") GifticonType type,
		@Param("fileType") FileType fileType,
		Pageable pageable
	);

	@Query("""
		SELECT new com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto(
		      g.id,
		      g.name,
		      g.type,
		      g.expiryDate,
		      b.id,
		      b.name,
		      CASE WHEN g.sharebox.id IS NULL THEN 'MY_BOX' ELSE 'SHARE_BOX' END,
		      u.id,
		      u.name,
		      g.sharebox.id,
		      sb.name,
		      (
		        SELECT f1.path
		          FROM File f1
		         WHERE f1.referenceEntityType = 'GIFTICON'
		           AND f1.referenceEntityId = g.id
		           AND f1.type = 'THUMBNAIL'
		           AND f1.id = (
		             SELECT MIN(f2.id)
		               FROM File f2
		              WHERE f2.referenceEntityType = 'GIFTICON'
		                AND f2.referenceEntityId = g.id
		                AND f2.type = 'THUMBNAIL'
		           )
		      ),
		      (
		        SELECT f1.path
		          FROM File f1
		         WHERE f1.referenceEntityType = 'GIFTICON'
		           AND f1.referenceEntityId = g.id
		           AND f1.type = 'ORIGINAL'
		           AND f1.id = (
		             SELECT MIN(f2.id)
		               FROM File f2
		              WHERE f2.referenceEntityType = 'GIFTICON'
		                AND f2.referenceEntityId = g.id
		                AND f2.type = 'ORIGINAL'
		           )
		      ),
		      g.createdAt,
		      CASE WHEN g.type = 'AMOUNT' THEN g.originalAmount ELSE NULL END,
		      CASE WHEN g.type = 'AMOUNT' THEN g.remainingAmount ELSE NULL END
		  )
		  FROM Gifticon g
		  JOIN g.brand b
		  JOIN g.user u
		  LEFT JOIN g.sharebox sb
		  WHERE g.isDeleted = false
		    AND g.isUsed = false
		    AND (g.remainingAmount > 0 OR g.remainingAmount = -1)
		    AND g.expiryDate > CURRENT_DATE
		    AND g.id = :gifticonId
		    AND g.user.id = :userId
		""")
	Optional<AvailableGifticonDetailResponseDto> findAvailableGifticonDetail(
		@Param("gifticonId") Integer gifticonId,
		@Param("userId") Integer userId
	);
}
