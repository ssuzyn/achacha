import React from 'react';

function PresentCard({ presentCard }) {
  if (!presentCard) {
    return null; // 또는 로딩/에러 상태 표시
  }

  const { 
    presentCardMessage,
    gifticonOriginalPath, 
    // gifticonThumbnailPath, // 썸네일이 필요하면 사용
    templateCardPath,
    // expiryDateTime // 유효기간 표시가 필요하면 사용
  } = presentCard;

  // templateCardPath가 "GENERAL" 문자열을 포함하는지 또는 특정 색상 코드인지 여부로 판단해야 합니다.
  // API 응답 명세에 따라 "GENERAL" 템플릿을 식별하는 정확한 로직이 필요합니다.
  // 여기서는 templateCardPath에 "GENERAL"이 포함되어 있는지로 임시 판단합니다.
  const isGeneralTemplate = templateCardPath && templateCardPath.toLowerCase().includes('general');
  const generalTemplateColor = isGeneralTemplate ? templateCardPath.split('_').pop().split('.')[0] : 'transparent'; // 예: general_FFDC4F.png 에서 FFDC4F 추출

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div 
        className="present-card-container w-full max-w-sm rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundColor: isGeneralTemplate ? `#${generalTemplateColor}` : 'transparent',
          backgroundImage: !isGeneralTemplate && templateCardPath ? `url(${templateCardPath})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className={`present-card p-6 ${isGeneralTemplate ? 'text-black' : 'text-white'}`}> {/* 텍스트 색상 조건부 적용 */}
          <div className="message-area mb-6 min-h-[100px]">
            <p className="text-lg whitespace-pre-wrap break-words">
              {presentCardMessage}
            </p>
          </div>

          {gifticonOriginalPath && (
            <div className="gifticon-area border-t border-gray-300 pt-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-center">선물</h3>
              <img
                src={gifticonOriginalPath}
                alt="Gifticon"
                className="w-full h-auto rounded-md object-contain max-h-96 mx-auto"
              />
              {/* 기프티콘 이름, 유효기간 등 추가 정보 표시 가능 */}
              {/* expiryDateTime && <p className="text-sm text-center mt-2">유효기간: {expiryDateTime}</p> */}
            </div>
          )}
        </div>
      </div>
      <p className="mt-8 text-sm text-gray-500">선물을 확인했습니다!</p>
    </div>
  );
}

export default PresentCard;
