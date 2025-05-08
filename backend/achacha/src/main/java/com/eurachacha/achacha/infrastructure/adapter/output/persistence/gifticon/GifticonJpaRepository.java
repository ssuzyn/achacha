package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

@Repository
public interface GifticonJpaRepository extends JpaRepository<Gifticon, Integer>, GifticonRepositoryCustom {
	@Query("""
		SELECT
			g
		FROM Gifticon g
		JOIN FETCH g.brand
		JOIN FETCH g.user
		LEFT JOIN FETCH g.sharebox
		WHERE g.id = :gifticonId
		""")
	Optional<Gifticon> findGifticonDetailById(@Param("gifticonId") Integer gifticonId);

}
