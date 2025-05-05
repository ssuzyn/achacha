package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class AvailableGifticonDomainServiceImpl implements AvailableGifticonDomainService {

    @Override
    public void validateGifticonAccess(Integer requestUserId, Integer gifticonUserId) {
        if (!Objects.equals(requestUserId, gifticonUserId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
        }
    }
}
