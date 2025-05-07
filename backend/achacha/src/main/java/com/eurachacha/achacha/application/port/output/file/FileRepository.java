package com.eurachacha.achacha.application.port.output.file;

import com.eurachacha.achacha.domain.model.gifticon.File;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;

public interface FileRepository {
	File findFile(Integer referenceEntityId, String referenceEntityType, FileType fileType);
}
