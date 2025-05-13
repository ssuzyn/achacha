package com.eurachacha.achacha.application.service.sharebox;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxParticipationSettingRequestDto;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.sharebox.ShareBoxDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ShareBoxAppServiceImplTest {

	@Mock
	private ShareBoxDomainService shareBoxDomainService;

	@Mock
	private GifticonDomainService gifticonDomainService;

	@Mock
	private ShareBoxRepository shareBoxRepository;

	@Mock
	private GifticonRepository gifticonRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private ParticipationRepository participationRepository;

	@InjectMocks
	private ShareBoxAppServiceImpl shareBoxAppService;

	@Test
	@DisplayName("기프티콘 공유 - 성공적으로 공유되면 예외가 발생하지 않아야 한다")
	void shareGifticon_WhenGifticonShareable_ThenSuccessfullyShare() {
		// given
		Integer shareBoxId = 1;
		Integer gifticonId = 1;
		Integer userId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 공유박스").build();
		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.type(GifticonType.AMOUNT)
			.originalAmount(10000)
			.remainingAmount(10000)
			.user(user)
			.build();

		// BDDMockito를 사용한 mock 설정
		given(shareBoxRepository.findById(shareBoxId)).willReturn(shareBox);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(gifticonDomainService.hasAccess(userId, userId)).willReturn(true);
		willDoNothing().given(gifticonDomainService).validateGifticonSharable(gifticon);
		given(gifticonRepository.save(any(Gifticon.class))).willReturn(gifticon);

		// when
		shareBoxAppService.shareGifticon(shareBoxId, gifticonId);

		// then
		verify(shareBoxRepository).findById(eq(shareBoxId));
		verify(participationRepository).checkParticipation(eq(userId), eq(shareBoxId));
		verify(gifticonRepository).findById(eq(gifticonId));
		verify(gifticonDomainService).hasAccess(eq(userId), eq(userId));
		verify(gifticonDomainService).validateGifticonSharable(eq(gifticon));

		// Gifticon 업데이트 검증
		ArgumentCaptor<Gifticon> gifticonCaptor = ArgumentCaptor.forClass(Gifticon.class);
		verify(gifticonRepository).save(gifticonCaptor.capture());
		Gifticon capturedGifticon = gifticonCaptor.getValue();

		assertThat(capturedGifticon.getSharebox()).isEqualTo(shareBox);
	}

	@Test
	@DisplayName("기프티콘 공유 - 참여하지 않은 쉐어박스에는 공유할 수 없어야 한다")
	void shareGifticon_WhenNotParticipatingShareBox_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Integer gifticonId = 1;
		Integer userId = 1;

		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 공유박스").build();

		// BDDMockito를 사용한 mock 설정
		given(shareBoxRepository.findById(shareBoxId)).willReturn(shareBox);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(false);

		// when & then
		assertThatThrownBy(() -> shareBoxAppService.shareGifticon(shareBoxId, gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_SHAREBOX_ACCESS);

		// 기프티콘 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	@Test
	@DisplayName("기프티콘 공유 - 소유하지 않은 기프티콘은 공유할 수 없어야 한다")
	void shareGifticon_WhenNotOwnedGifticon_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Integer gifticonId = 1;
		Integer userId = 1;
		Integer otherUserId = 2;

		User otherUser = User.builder().id(otherUserId).name("다른 사용자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 공유박스").build();
		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.user(otherUser)
			.build();

		// BDDMockito를 사용한 mock 설정
		given(shareBoxRepository.findById(shareBoxId)).willReturn(shareBox);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(gifticonDomainService.hasAccess(userId, otherUserId)).willReturn(false);

		// when & then
		assertThatThrownBy(() -> shareBoxAppService.shareGifticon(shareBoxId, gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);

		// 기프티콘 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	@Test
	@DisplayName("기프티콘 공유 - 도메인 검증을 통과하지 못하면 공유할 수 없어야 한다")
	void shareGifticon_WhenDomainValidationFails_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Integer gifticonId = 1;
		Integer userId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 공유박스").build();
		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.user(user)
			.build();

		// BDDMockito를 사용한 mock 설정
		given(shareBoxRepository.findById(shareBoxId)).willReturn(shareBox);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(gifticonDomainService.hasAccess(userId, userId)).willReturn(true);
		willThrow(new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED))
			.given(gifticonDomainService).validateGifticonSharable(gifticon);

		// when & then
		assertThatThrownBy(() -> shareBoxAppService.shareGifticon(shareBoxId, gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_SHARED);

		// 기프티콘 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	@DisplayName("기프티콘 공유 해제 - 성공적으로 공유 해제되면 예외가 발생하지 않아야 한다.")
	@Test
	void unshareGifticon_WhenGifticonSharedInShareBox_ThenSuccessfullyUnshare() {
		// given
		Integer shareBoxId = 1;
		Integer gifticonId = 1;
		Integer userId = 1;

		User user = User.builder()
			.id(userId)
			.name("테스트 사용자")
			.build();
		ShareBox shareBox = ShareBox.builder()
			.id(shareBoxId)
			.build();
		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.type(GifticonType.AMOUNT)
			.originalAmount(10000)
			.remainingAmount(10000)
			.user(user)
			.sharebox(shareBox)
			.build();

		given(shareBoxRepository.existsById(shareBoxId)).willReturn(true);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(gifticonDomainService.hasAccess(userId, gifticon.getUser().getId())).willReturn(true);
		willDoNothing().given(gifticonDomainService).validateGifticonSharedInShareBox(gifticon, shareBoxId);

		// when
		shareBoxAppService.unshareGifticon(shareBoxId, gifticonId);

		// then
		verify(shareBoxRepository).existsById(eq(shareBoxId));
		verify(participationRepository).checkParticipation(eq(userId), eq(shareBoxId));
		verify(gifticonRepository).findById(eq(gifticonId));
		verify(gifticonDomainService).hasAccess(eq(userId), eq(gifticon.getUser().getId()));
		verify(gifticonDomainService).validateGifticonSharedInShareBox(eq(gifticon), eq(shareBoxId));

		assertThat(gifticon.getSharebox()).isNull();
	}

	@DisplayName("기프티콘 공유 해제 - 쉐어박스가 존재하지 않으면 예외가 발생해야 한다.")
	@Test
	void unshareGifticon_WhenGifticonSharedInShareBox_ThenThrowException() {
		// given
		Integer shareBoxId = 999;
		Integer gifticonId = 1;

		given(shareBoxRepository.existsById(shareBoxId)).willReturn(false);

		// when
		Throwable thrown = catchThrowable(() ->
			shareBoxAppService.unshareGifticon(shareBoxId, gifticonId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.SHAREBOX_NOT_FOUND);
	}

	@DisplayName("기프티콘 공유 해제 - 참여하지 않은 쉐어박스에서는 공유 해제할 수 없어야 한다")
	@Test
	void unsharedGifticon_WhenNotParticipatedInShareBox_ThenThrowException() {
		// given
		Integer shareBoxId = 3;
		Integer gifticonId = 2;
		Integer userId = 1;

		given(shareBoxRepository.existsById(shareBoxId)).willReturn(true);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(false);

		// when
		Throwable thrown = catchThrowable(() ->
			shareBoxAppService.unshareGifticon(shareBoxId, gifticonId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_SHAREBOX_ACCESS);
	}

	@DisplayName("기프티콘 공유 해제 - 소유하지 않은 기프티콘은 공유 해제할 수 없어야 한다.")
	@Test
	void unshareGifticon_WhenNotOwn() {
		// given
		Integer shareBoxId = 3;
		Integer gifticonId = 2;
		Integer userId = 1;
		Integer otherUserId = 2;

		User otherUser = User.builder().id(otherUserId).name("다른 사용자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 쉐어박스").build();
		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.user(otherUser)
			.sharebox(shareBox)
			.build();

		// BDDMockito를 사용한 mock 설정
		given(shareBoxRepository.existsById(shareBoxId)).willReturn(true);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(gifticonDomainService.hasAccess(userId, otherUserId)).willReturn(false);

		// when
		Throwable thrown = catchThrowable(() ->
			shareBoxAppService.unshareGifticon(shareBoxId, gifticonId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
	}

	@DisplayName("기프티콘 공유 해제 - 해당 쉐어박스에 공유되지 않은 기프티콘은 해제할 수 없어야 한다")
	@Test
	void unshareGifticon_WhenGifticonNotSharedInShareBox_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Integer gifticonId = 1;
		Integer userId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 공유박스").build();
		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.user(user)
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		// BDDMockito를 사용한 mock 설정
		given(shareBoxRepository.existsById(shareBoxId)).willReturn(true);
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(gifticonDomainService.hasAccess(userId, userId)).willReturn(true);
		willThrow(new CustomException(ErrorCode.GIFTICON_NOT_SHARED_IN_THIS_SHAREBOX))
			.given(gifticonDomainService).validateGifticonSharedInShareBox(gifticon, shareBoxId);

		// when
		Throwable thrown = catchThrowable(() ->
			shareBoxAppService.unshareGifticon(shareBoxId, gifticonId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_NOT_SHARED_IN_THIS_SHAREBOX);
	}

	@DisplayName("쉐어박스 참여 설정 변경 - 방장이 요청하면 성공적으로 변경되어야 한다")
	@Test
	void updateParticipationSetting_WhenUserIsOwner_ThenSuccessfullyUpdate() {
		// given
		Integer shareBoxId = 1;
		Integer userId = 1;
		Boolean newSetting = true;

		ShareBoxParticipationSettingRequestDto requestDto = new ShareBoxParticipationSettingRequestDto();
		ReflectionTestUtils.setField(requestDto, "shareBoxAllowParticipation", newSetting);

		User user = User.builder()
			.id(userId)
			.name("테스트 사용자")
			.build();

		ShareBox shareBox = mock(ShareBox.class);

		given(shareBoxRepository.findById(shareBoxId)).willReturn(shareBox);
		willDoNothing().given(shareBoxDomainService).validateShareBoxOwner(shareBox, userId);

		// when
		Throwable thrown = catchThrowable(() ->
			shareBoxAppService.updateParticipationSetting(shareBoxId, requestDto));

		// then
		assertThat(thrown).isNull();
		verify(shareBoxRepository).findById(eq(shareBoxId));
		verify(shareBoxDomainService).validateShareBoxOwner(eq(shareBox), eq(userId));
		verify(shareBox).updateAllowParticipation(eq(newSetting));
	}

	@DisplayName("쉐어박스 참여 설정 변경 - 방장이 아닌 사용자가 요청하면 예외가 발생해야 한다")
	@Test
	void updateParticipationSetting_WhenUserIsNotOwner_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Integer userId = 1;
		Boolean newSetting = true;

		ShareBoxParticipationSettingRequestDto requestDto = new ShareBoxParticipationSettingRequestDto();
		ReflectionTestUtils.setField(requestDto, "shareBoxAllowParticipation", newSetting);

		ShareBox shareBox = mock(ShareBox.class);

		given(shareBoxRepository.findById(shareBoxId)).willReturn(shareBox);
		willThrow(new CustomException(ErrorCode.UNAUTHORIZED_SHAREBOX_OWNER_ACCESS))
			.given(shareBoxDomainService).validateShareBoxOwner(shareBox, userId);

		// when
		Throwable thrown = catchThrowable(() ->
			shareBoxAppService.updateParticipationSetting(shareBoxId, requestDto));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_SHAREBOX_OWNER_ACCESS);

		verify(shareBox, never()).updateAllowParticipation(any());
	}
}
