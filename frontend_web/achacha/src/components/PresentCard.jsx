import React from 'react';

function PresentCard({ presentCard }) {
  if (!presentCard) {
    // 데이터가 로드되지 않았거나 오류 발생 시 아무것도 표시하지 않음
    // PresentPage에서 로딩 및 오류 UI를 처리하므로 여기서는 null 반환 유지 가능
    return null;
  }

  // API 응답 데이터 구조
  const {
    presentCardMessage: message,
    gifticonOriginalPath: gifticonImageUrl,
    templateCardPath,
    expiryDateTime
  } = presentCard;

  // 템플릿 타입 판단 (GENERAL 여부)
  const fileName = templateCardPath ? templateCardPath.substring(templateCardPath.lastIndexOf('/') + 1) : '';
  const isGeneralTemplate = fileName.toLowerCase().startsWith('general_');
  
  // GENERAL 템플릿인 경우 색상 코드 추출
  let backgroundColor = 'transparent';
  if (isGeneralTemplate) {
    const parts = fileName.split('_');
    if (parts.length > 1) {
      backgroundColor = `#${parts[1].split('.')[0]}`; // e.g., "FFDC4F"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div
        className="present-card-container w-full max-w-md rounded-xl shadow-2xl overflow-hidden my-8"
        style={{
          backgroundColor: isGeneralTemplate ? backgroundColor : 'transparent',
          backgroundImage: !isGeneralTemplate ? `url(${templateCardPath})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          aspectRatio: '9/16',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className={`present-card p-6 sm:p-8 flex flex-col flex-grow justify-between ${isGeneralTemplate ? 'text-black' : 'text-white'}`}>
          <div className="message-area mb-6 min-h-[120px] flex-grow">
            <p className="text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap break-words filter drop-shadow-sm">
              {message}
            </p>
          </div>

          {gifticonImageUrl && (
            <div className="gifticon-area border-t border-gray-300 pt-6 mt-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center filter drop-shadow-sm">
                받으신 선물
              </h3>
              <img
                src={gifticonImageUrl}
                alt="기프티콘 이미지"
                className="w-full h-auto rounded-lg object-contain max-h-80 sm:max-h-96 mx-auto shadow-md"
              />
              {expiryDateTime && (
                <p className="text-xs text-center mt-2 text-gray-500">
                  유효기간: {expiryDateTime}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 mb-8 text-sm text-gray-600">선물을 확인했습니다!</p>
    </div>
  );
}

export default PresentCard;
