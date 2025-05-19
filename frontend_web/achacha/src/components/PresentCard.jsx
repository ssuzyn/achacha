import React from 'react';

function PresentCard({ presentCard }) {
  if (!presentCard) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>선물 정보를 불러오지 못했습니다.</p></div>;
  }

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('PresentCard에 전달된 데이터:', presentCard);

  const {
    presentCardCode,
    presentCardMessage,
    gifticonOriginalPath,
    gifticonThumbnailPath,
    templateCardPath,
    expiryDateTime
  } = presentCard;

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('구조분해할당 후 데이터:', {
    presentCardCode,
    presentCardMessage,
    gifticonOriginalPath,
    gifticonThumbnailPath,
    templateCardPath,
    expiryDateTime
  });

  // 브라우저에서 이미지 저장 기능
  const handleSaveImage = () => {
    // 카드 이미지를 새 창에서 열기 (사용자가 직접 저장할 수 있도록)
    window.open(gifticonOriginalPath, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url(${templateCardPath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          aspectRatio: '3/5', // 카드 비율 조정
        }}
      >
        {/* 메시지 영역 */}
        <div className="flex flex-col items-center pt-40 px-5 pb-5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{presentCardMessage}</h2>
          </div>
          
          {/* 점선 구분선 */}
          <div className="w-full border-t border-dashed border-gray-400 my-4"></div>
          
          {/* 기프티콘 이미지 영역 */}
          <div className="w-full flex justify-center my-4">
            <div className="rounded-lg border-2 border-blue-300 overflow-hidden w-64 h-64 bg-white flex items-center justify-center">
              <img 
                src={gifticonOriginalPath}
                alt="기프티콘" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          
          {/* 갤러리에 저장 버튼 */}
          <button
            onClick={handleSaveImage}
            className="mt-6 bg-blue-100 text-blue-600 font-semibold py-3 px-6 rounded-full w-full"
          >
            갤러리에 저장
          </button>
        </div>
      </div>
      
      {/* 유효기간 정보 */}
      {expiryDateTime && (
        <div className="mt-4 text-sm text-gray-500">
          유효기간: {expiryDateTime}
        </div>
      )}
    </div>
  );
}

export default PresentCard;
