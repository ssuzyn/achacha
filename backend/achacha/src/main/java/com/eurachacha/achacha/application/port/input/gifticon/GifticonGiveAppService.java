package com.eurachacha.achacha.application.port.input.gifticon;

import java.util.List;

public interface GifticonGiveAppService {
	void giveAwayGifticon(Integer gifticonId, List<String> uuids);
}
