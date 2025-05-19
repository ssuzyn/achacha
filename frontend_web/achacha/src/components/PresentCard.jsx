import React from 'react';

function PresentCard({ presentCard }) {
  if (!presentCard) {
    console.error('PresentCard: 전달받은 데이터가 없습니다.');
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>선물 정보를 불러오지 못했습니다.</p></div>;
  }
  
  // HTML 응답 체크
  if (typeof presentCard === 'string' && presentCard.includes('<!doctype html>')) {
    console.error('PresentCard: HTML이 데이터로 전달되었습니다. API 응답 확인이 필요합니다.');
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">API 응답 오류</h2>
          <p>서버가 JSON 데이터 대신 HTML을 반환했습니다.</p>
          <p className="text-sm mt-2">서버 설정이나 API 엔드포인트를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('PresentCard: 전달받은 데이터 (타입):', typeof presentCard, presentCard);
  
  // 데이터 유효성 검사
  const isValidData = 
    presentCard.presentCardMessage && 
    presentCard.gifticonOriginalPath &&
    presentCard.templateCardPath;
    
  if (!isValidData) {
    console.error('PresentCard: 필수 데이터가 누락되었습니다. 받은 데이터:', presentCard);
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">데이터 형식 오류</h2>
          <p>필수 정보가 누락되었습니다.</p>
          <p className="text-sm mt-2">
            {!presentCard.presentCardMessage && <span className="block">- 메시지 누락</span>}
            {!presentCard.gifticonOriginalPath && <span className="block">- 기프티콘 이미지 누락</span>}
            {!presentCard.templateCardPath && <span className="block">- 템플릿 카드 이미지 누락</span>}
          </p>
        </div>
      </div>
    );
  }

  const {
    presentCardCode,
    presentCardMessage,
    gifticonOriginalPath,
    gifticonThumbnailPath,
    templateCardPath,
    expiryDateTime
  } = presentCard;

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('PresentCard: 구조분해할당 완료된 데이터:', {
    presentCardCode: presentCardCode || '(없음)',
    presentCardMessage: presentCardMessage || '(없음)',
    gifticonOriginalPath: gifticonOriginalPath || '(없음)',
    gifticonThumbnailPath: gifticonThumbnailPath || '(없음)', 
    templateCardPath: templateCardPath || '(없음)',
    expiryDateTime: expiryDateTime || '(없음)'
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
                onError={(e) => {
                  console.error('기프티콘 이미지 로드 실패:', e);
                  e.target.src = "/fallback-image.png"; // 기본 이미지로 대체
                  e.target.onerror = null; // 추가 에러 방지
                }}
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
