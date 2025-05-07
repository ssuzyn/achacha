package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

@Repository
public interface GifticonJpaRepository extends JpaRepository<Gifticon, Integer>, GifticonRepositoryCustom {
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
		      null,
		      null,
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
		    AND (g.remainingAmount > 0 OR g.remainingAmount is null)
		    AND g.expiryDate > CURRENT_DATE
		    AND g.id = :gifticonId
		""")
	Optional<AvailableGifticonDetailResponseDto> findAvailableGifticonDetail(
		@Param("gifticonId") Integer gifticonId
	);

	@Query("""
		SELECT new com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto(
		      g.id,
		      g.name,
		      g.type,
		      g.expiryDate,
		      b.id,
		      b.name,
		      CASE 
		        WHEN oh.id IS NOT NULL THEN 
		          CASE 
		            WHEN oh.transferType = 'GIVE_AWAY' THEN 'GIVE_AWAY'
		            WHEN oh.transferType = 'PRESENT' THEN 'PRESENT'
		          END
		        ELSE 'SELF_USE'
		      END,
		      COALESCE(oh.createdAt, uh.createdAt) as usedAt,
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
		  LEFT JOIN GifticonOwnerHistory oh ON g.id = oh.gifticon.id AND oh.fromUser.id = :userId
		  LEFT JOIN UsageHistory uh ON g.id = uh.gifticon.id AND uh.user.id = :userId
		  WHERE (
		      (oh.id IS NOT NULL)
		      OR (g.user.id = :userId AND g.isUsed = true) 
		      OR (g.user.id != :userId AND g.isUsed = true AND uh.id IS NOT NULL)
		  )
		  AND g.isDeleted = false
		  AND (:type IS NULL OR g.type = :type)
		  GROUP BY g.id, b.id, oh.id, oh.transferType, oh.createdAt, uh.createdAt
		""")
	Slice<UsedGifticonResponseDto> findUsedGifticons(
		@Param("userId") Integer userId,
		@Param("type") GifticonType gifticonType,
		@Param("fileType") FileType fileType,
		Pageable pageable
	);
}
