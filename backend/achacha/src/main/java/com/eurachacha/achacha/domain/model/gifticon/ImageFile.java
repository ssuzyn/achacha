package com.eurachacha.achacha.domain.model.gifticon;

import com.eurachacha.achacha.domain.model.common.TimeStampEntity;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "file")
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
public class ImageFile extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String path;

    @Column(length = 32)
    @Enumerated(EnumType.STRING)
    private FileType type;

    private String referenceEntityType;

    private Integer referenceEntityId;

}
