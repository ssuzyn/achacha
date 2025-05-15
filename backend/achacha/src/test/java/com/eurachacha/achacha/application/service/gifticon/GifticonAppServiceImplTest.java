package com.eurachacha.achacha.application.service.gifticon;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.output.ai.OcrTrainingDataRepository;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.file.FileDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class GifticonAppServiceImplTest {

	@Mock
	private GifticonDomainService gifticonDomainService;

	@Mock
	private GifticonRepository gifticonRepository;

	@Mock
	private ParticipationRepository participationRepository;

	@Mock
	private BrandRepository brandRepository;

	@Mock
	private ShareBoxRepository shareBoxRepository;

	@Mock
	private OcrTrainingDataRepository ocrTrainingDataRepository;

	@Mock
	private FileStoragePort fileStoragePort;

	@Mock
	private FileRepository fileRepository;

	@Mock
	private FileDomainService fileDomainService;

	@Mock
	private SecurityServicePort securityServicePort;

	@InjectMocks
	private GifticonAppServiceImpl gifticonAppService;

	@Test
	@DisplayName("금액형 기프티콘 저장 - 성공적으로 저장되면 예외가 발생하지 않아야 한다")
	void saveGifticon_WhenAmountTypeGifticon_ThenSuccessfullySave() {
		// given
		GifticonSaveRequestDto requestDto = createAmountTypeGifticonRequestDto();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		Integer userId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();
		Gifticon savedGifticon = Gifticon.builder().id(1).build();

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), anyInt());
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(false);
		given(brandRepository.findById(anyInt())).willReturn(brand);
		given(gifticonRepository.save(any(Gifticon.class))).willReturn(savedGifticon);
		given(fileStoragePort.uploadFile(any(), any(), anyInt())).willReturn("test/path");

		// when
		gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage);

		// then
		verify(fileDomainService, times(3)).validateImageFile(any(MultipartFile.class));
		verify(gifticonDomainService).validateGifticonAmount(eq(GifticonType.AMOUNT), eq(10000));
		verify(gifticonRepository).existsByBarcode(eq("1234567890"));
		verify(brandRepository).findById(eq(1));

		// Gifticon 저장 검증
		ArgumentCaptor<Gifticon> gifticonCaptor = ArgumentCaptor.forClass(Gifticon.class);
		verify(gifticonRepository).save(gifticonCaptor.capture());
		Gifticon capturedGifticon = gifticonCaptor.getValue();

		assertThat(capturedGifticon.getName()).isEqualTo("테스트 기프티콘");
		assertThat(capturedGifticon.getBarcode()).isEqualTo("1234567890");
		assertThat(capturedGifticon.getType()).isEqualTo(GifticonType.AMOUNT);
		assertThat(capturedGifticon.getOriginalAmount()).isEqualTo(10000);
		assertThat(capturedGifticon.getRemainingAmount()).isEqualTo(10000);

		// 파일 업로드 검증
		verify(fileStoragePort, times(3)).uploadFile(any(), any(), eq(1));
		verify(fileRepository, times(3)).save(any(File.class));

		// 메타데이터 업데이트 검증
		verify(ocrTrainingDataRepository).updateUserCorrectedForAmount(
			eq(requestDto.getOcrTrainingDataId()),
			eq(requestDto.getGifticonBarcodeNumber()),
			eq(brand.getName()),
			eq(requestDto.getGifticonName()),
			eq(requestDto.getGifticonExpiryDate().toString()),
			eq(requestDto.getGifticonAmount())
		);
	}

	@Test
	@DisplayName("상품형 기프티콘 저장 - 성공적으로 저장되면 예외가 발생하지 않아야 한다")
	void saveGifticon_WhenProductTypeGifticon_ThenSuccessfullySave() {
		// given
		GifticonSaveRequestDto requestDto = createProductTypeGifticonRequestDto();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		Integer userId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();
		Gifticon savedGifticon = Gifticon.builder().id(1).build();

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), any());
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(false);
		given(brandRepository.findById(anyInt())).willReturn(brand);
		given(gifticonRepository.save(any(Gifticon.class))).willReturn(savedGifticon);
		given(fileStoragePort.uploadFile(any(), any(), anyInt())).willReturn("test/path");

		// when
		gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage);

		// then
		verify(fileDomainService, times(3)).validateImageFile(any(MultipartFile.class));
		verify(gifticonDomainService).validateGifticonAmount(eq(GifticonType.PRODUCT), eq(null));

		// 메타데이터 업데이트 검증 - 상품형은 다른 메서드 호출
		verify(ocrTrainingDataRepository).updateUserCorrectedForProduct(
			eq(requestDto.getOcrTrainingDataId()),
			eq(requestDto.getGifticonBarcodeNumber()),
			eq(brand.getName()),
			eq(requestDto.getGifticonName()),
			eq(requestDto.getGifticonExpiryDate().toString())
		);
	}

	@Test
	@DisplayName("기프티콘 저장 - 중복된 바코드 번호가 있으면 예외가 발생해야 한다")
	void saveGifticon_WhenBarcodeAlreadyExists_ThenThrowException() {
		// given
		GifticonSaveRequestDto requestDto = createAmountTypeGifticonRequestDto();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), anyInt());
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(true);

		// when & then
		assertThatThrownBy(() ->
			gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_BARCODE_DUPLICATE);

		// 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	@Test
	@DisplayName("기프티콘 저장 - 공유 박스에 대한 접근 권한이 없으면 예외가 발생해야 한다")
	void saveGifticon_WhenUnauthorizedShareBoxAccess_ThenThrowException() {
		// given
		GifticonSaveRequestDto requestDto = createAmountTypeGifticonRequestDtoWithShareBox();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		ShareBox shareBox = ShareBox.builder().id(1).name("테스트 공유박스").build();

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), anyInt());
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(false);
		given(shareBoxRepository.findById(anyInt())).willReturn(shareBox);
		given(participationRepository.checkParticipation(anyInt(), anyInt())).willReturn(false);

		// when & then
		assertThatThrownBy(() ->
			gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);

		// 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	// 테스트 헬퍼 메서드
	private GifticonSaveRequestDto createAmountTypeGifticonRequestDto() {
		return new GifticonSaveRequestDto(
			"1234567890",      // 바코드
			1,                  // 브랜드 ID
			"테스트 기프티콘",      // 상품명
			LocalDate.now().plusMonths(3), // 유효기간
			GifticonType.AMOUNT, // 타입
			10000,              // 금액
			null,               // 공유박스 ID (없음)
			"1"                 // OCR 학습 데이터 ID
		);
	}

	private GifticonSaveRequestDto createProductTypeGifticonRequestDto() {
		return new GifticonSaveRequestDto(
			"1234567890",      // 바코드
			1,                  // 브랜드 ID
			"테스트 기프티콘",      // 상품명
			LocalDate.now().plusMonths(3), // 유효기간
			GifticonType.PRODUCT, // 타입
			null,               // 금액 (상품형은 null)
			null,               // 공유박스 ID (없음)
			"1"                 // OCR 학습 데이터 ID
		);
	}

	private GifticonSaveRequestDto createAmountTypeGifticonRequestDtoWithShareBox() {
		return new GifticonSaveRequestDto(
			"1234567890",      // 바코드
			1,                  // 브랜드 ID
			"테스트 기프티콘",      // 상품명
			LocalDate.now().plusMonths(3), // 유효기간
			GifticonType.AMOUNT, // 타입
			10000,              // 금액
			1,                  // 공유박스 ID
			"1"                 // OCR 학습 데이터 ID
		);
	}
}