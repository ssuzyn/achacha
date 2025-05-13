package com.eurachacha.achacha.application.port.input.gifticon;

import java.util.List;

public interface GifticonSharingAppService {
	void giveAwayGifticon(Integer gifticonId, List<String> uuids);
}
