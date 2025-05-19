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
            {!presentCard.gifticonOriginalPath && <span className="block">기프티콘 이미지 누락</span>}
            {!presentCard.templateCardPath && <span className="block">템플릿 카드 이미지 누락</span>}
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
  
  // 메시지가 비어있을 경우 기본 메시지로 대체
  const displayMessage = presentCardMessage || "아차차에서 선물이 도착했어요!";

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('PresentCard: 구조분해할당 완료된 데이터:', {
    presentCardCode: presentCardCode || '(없음)',
    presentCardMessage: presentCardMessage || '(없음)',
    gifticonOriginalPath: gifticonOriginalPath || '(없음)',
    gifticonThumbnailPath: gifticonThumbnailPath || '(없음)', 
    templateCardPath: templateCardPath || '(없음)',
    expiryDateTime: expiryDateTime || '(없음)'
  });

  // 이미지 다운로드 함수
  const handleSaveImage = () => {
    // 이미지 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = gifticonOriginalPath;
    link.download = `기프티콘_${presentCardCode || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 전체 카드 컨테이너 */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-lg">
        {/* 템플릿 이미지 (배경) - z-0 */}
        <img 
          src={templateCardPath} 
          alt="템플릿 카드" 
          className="w-full h-auto z-0 relative"
        />
        
        {/* 메시지 영역 (중앙) - z-10 */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-10">
          <div className="bg-white rounded-xl p-4 mx-4 w-[80%] shadow-md">
            <h2 className="text-xl text-center font-medium text-gray-700">
              {displayMessage}
            </h2>
          </div>
        </div>
        
        {/* 기프티콘 썸네일 이미지 (하단 중앙) - z-20 */}
        <div className="absolute left-0 right-0 bottom-[25%] flex justify-center z-20">
          <div className="border border-blue-300 rounded-lg overflow-hidden w-56 h-56 bg-white shadow-md">
            <img 
              src={gifticonThumbnailPath || gifticonOriginalPath} 
              alt="기프티콘 썸네일" 
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('썸네일 이미지 로드 실패:', e);
                // 이미 fallback 이미지인 경우 더 이상 처리하지 않음
                if (e.target.src.includes('fallback-image.png')) {
                  e.target.onerror = null;
                  return;
                }
                
                // 썸네일이 실패했고, 원본을 시도하지 않은 경우만 원본으로 교체
                if (e.target.src !== gifticonOriginalPath && gifticonOriginalPath) {
                  e.target.src = gifticonOriginalPath;
                  e.target.onerror = (e2) => {
                    console.error('원본 이미지도 로드 실패:', e2);
                    e2.target.src = "/fallback-image.png";
                    e2.target.onerror = null;
                  };
                } else {
                  // 원본도 실패한 경우 기본 이미지로
                  e.target.src = "/fallback-image.png";
                  e.target.onerror = null;
                }
              }}
            />
          </div>
        </div>
        
        {/* 저장 버튼 (하단에 고정) - z-30 */}
        <div className="absolute left-0 right-0 bottom-6 flex justify-center z-30">
          <button
            onClick={handleSaveImage}
            className="bg-blue-100 text-blue-600 font-semibold py-3 px-6 rounded-full w-[80%] shadow-md"
          >
            갤러리에 저장
          </button>
        </div>
      </div>
      
      {/* 유효기간 정보 */}
      {expiryDateTime && (
        <div className="mt-4 text-sm text-gray-500">
          {expiryDateTime}
        </div>
      )}
    </div>
  );
}

export default PresentCard;
