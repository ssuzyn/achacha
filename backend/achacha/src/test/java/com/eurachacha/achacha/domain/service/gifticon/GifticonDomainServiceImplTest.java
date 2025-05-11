package com.eurachacha.achacha.domain.service.gifticon;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class GifticonDomainServiceImplTest {

	@InjectMocks
	private GifticonDomainServiceImpl gifticonDomainService;

	@Test
	@DisplayName("금액형 기프티콘인데 금액이 null이면 예외가 발생해야 한다")
	void validateGifticonAmount_WhenAmountTypeWithNullAmount_ThenThrowException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = null;

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
	}

	@Test
	@DisplayName("금액형 기프티콘인데 금액이 0이면 예외가 발생해야 한다")
	void validateGifticonAmount_WhenAmountTypeWithZeroAmount_ThenThrowException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = 0;

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
	}

	@Test
	@DisplayName("금액형 기프티콘인데 금액이 음수이면 예외가 발생해야 한다")
	void validateGifticonAmount_WhenAmountTypeWithNegativeAmount_ThenThrowException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = -1000;

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
	}

	@Test
	@DisplayName("금액형 기프티콘인데 금액이 양수이면 예외가 발생하지 않아야 한다")
	void validateGifticonAmount_WhenAmountTypeWithPositiveAmount_ThenNoException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = 10000;

		// when & then
		gifticonDomainService.validateGifticonAmount(type, amount);
		// 예외가 발생하지 않으면 테스트 성공
	}

	@Test
	@DisplayName("상품형 기프티콘은 금액이 null이어도 예외가 발생하지 않아야 한다")
	void validateGifticonAmount_WhenProductTypeWithNullAmount_ThenNoException() {
		// given
		GifticonType type = GifticonType.PRODUCT;
		Integer amount = null;

		// when & then
		gifticonDomainService.validateGifticonAmount(type, amount);
		// 예외가 발생하지 않으면 테스트 성공
	}

	@Test
	@DisplayName("유효기간이 지난 기프티콘은 만료됨으로 판단해야 한다")
	void isExpired_WhenExpiryDateIsBeforeToday_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getExpiryDate()).willReturn(LocalDate.now().minusDays(1));

		// when
		boolean result = gifticonDomainService.isExpired(gifticon);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("유효기간이 오늘인 기프티콘은 만료되지 않음으로 판단해야 한다")
	void isExpired_WhenExpiryDateIsToday_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getExpiryDate()).willReturn(LocalDate.now());

		// when
		boolean result = gifticonDomainService.isExpired(gifticon);

		// then
		assertThat(result).isFalse();
	}

	@Test
	@DisplayName("유효기간이 미래인 기프티콘은 만료되지 않음으로 판단해야 한다")
	void isExpired_WhenExpiryDateIsAfterToday_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getExpiryDate()).willReturn(LocalDate.now().plusDays(1));

		// when
		boolean result = gifticonDomainService.isExpired(gifticon);

		// then
		assertThat(result).isFalse();
	}

	@ParameterizedTest
	@CsvSource({
		"1, 1, true",
		"1, 2, false",
		"2, 1, false"
	})
	@DisplayName("요청 사용자 ID와 기프티콘 사용자 ID가 일치하면 접근 권한이 있다고 판단해야 한다")
	void hasAccess_WhenUserIdsMatch_ThenReturnTrueOtherwiseFalse(Integer requestUserId, Integer gifticonUserId,
		boolean expected) {
		// given
		// 파라미터로 제공

		// when
		boolean result = gifticonDomainService.hasAccess(requestUserId, gifticonUserId);

		// then
		assertThat(result).isEqualTo(expected);
	}

	@Test
	@DisplayName("삭제된 기프티콘은 삭제됨으로 판단해야 한다")
	void isDeleted_WhenGifticonIsDeleted_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when
		boolean result = gifticonDomainService.isDeleted(gifticon);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("삭제되지 않은 기프티콘은 삭제되지 않음으로 판단해야 한다")
	void isDeleted_WhenGifticonIsNotDeleted_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);

		// when
		boolean result = gifticonDomainService.isDeleted(gifticon);

		// then
		assertThat(result).isFalse();
	}

	@Test
	@DisplayName("사용된 기프티콘은 사용됨으로 판단해야 한다")
	void isUsed_WhenGifticonIsUsed_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsUsed()).willReturn(true);

		// when
		boolean result = gifticonDomainService.isUsed(gifticon);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("사용되지 않은 기프티콘은 사용되지 않음으로 판단해야 한다")
	void isUsed_WhenGifticonIsNotUsed_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsUsed()).willReturn(false);

		// when
		boolean result = gifticonDomainService.isUsed(gifticon);

		// then
		assertThat(result).isFalse();
	}

	@Test
	@DisplayName("삭제된 기프티콘은 예외가 발생해야 한다")
	void validateGifticonAvailability_WhenGifticonIsDeleted_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAvailability(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);
	}

	@Test
	@DisplayName("사용된 기프티콘은 예외가 발생해야 한다")
	void validateGifticonAvailability_WhenGifticonIsUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAvailability(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);
	}

	@Test
	@DisplayName("만료된 기프티콘은 예외가 발생해야 한다")
	void validateGifticonAvailability_WhenGifticonIsExpired_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);
		given(gifticon.getExpiryDate()).willReturn(LocalDate.now().minusDays(1));

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAvailability(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_EXPIRED);
	}

	@Test
	@DisplayName("사용 가능한 기프티콘은 예외가 발생하지 않아야 한다")
	void validateGifticonAvailability_WhenGifticonIsAvailable_ThenNoException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);
		given(gifticon.getExpiryDate()).willReturn(LocalDate.now().plusDays(1));

		// when & then
		gifticonDomainService.validateGifticonAvailability(gifticon);
		// 예외가 발생하지 않으면 테스트 성공
	}

	@Test
	@DisplayName("삭제된 기프티콘은 예외가 발생해야 한다")
	void validateGifticonIsUsed_WhenGifticonIsDeleted_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsUsed(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);
	}

	@Test
	@DisplayName("사용되지 않은 기프티콘은 예외가 발생해야 한다")
	void validateGifticonIsUsed_WhenGifticonIsNotUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsUsed(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_AVAILABLE);
	}

	@Test
	@DisplayName("사용된 기프티콘은 예외가 발생하지 않아야 한다")
	void validateGifticonIsUsed_WhenGifticonIsUsed_ThenNoException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(true);

		// when & then
		gifticonDomainService.validateGifticonIsUsed(gifticon);
		// 예외가 발생하지 않으면 테스트 성공
	}

	@Test
	@DisplayName("삭제된 기프티콘은 예외가 발생해야 한다")
	void validateGifticonIsAvailable_WhenGifticonIsDeleted_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsAvailable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);
	}

	@Test
	@DisplayName("사용된 기프티콘은 예외가 발생해야 한다")
	void validateGifticonIsAvailable_WhenGifticonIsUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsAvailable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);
	}

	@Test
	@DisplayName("사용 가능한 기프티콘은 예외가 발생하지 않아야 한다")
	void validateGifticonIsAvailable_WhenGifticonIsAvailable_ThenNoException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);

		// when & then
		gifticonDomainService.validateGifticonIsAvailable(gifticon);
		// 예외가 발생하지 않으면 테스트 성공
	}
}
