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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      {/* 전체 카드 컨테이너 */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        {/* 템플릿 이미지 (배경) */}
        <img 
          src={templateCardPath} 
          alt="템플릿 카드" 
          style={{ 
            width: '100%', 
            display: 'block',
            borderRadius: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }} 
        />
        
        {/* 컨텐츠 오버레이 */}
        <div style={{ 
          position: 'absolute', 
          top: 50, 
          left: 0, 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* 메시지 영역 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px',
            padding: '20px',
            width: '80%',
            marginTop: '20%',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#000',
              margin: 0
            }}>
              {displayMessage.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < displayMessage.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
          
          {/* 구분선 */}
          <div style={{ 
            width: '80%', 
            height: '1px',
            background: 'linear-gradient(to right, #6E6E6E 50%, transparent 50%)',
            backgroundSize: '16px 2px',
            margin: '10px 0'
          }}></div>
          
          {/* 기프티콘 영역 - 하나의 흰색 컨테이너로 통합 */}
          <div style={{ 
            width: '80%',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            {/* 썸네일 이미지 */}
            <div style={{ 
              border: '1px solid #3B82F6',
              borderRadius: '8px',
              padding: '3px',
              marginBottom: '10px'
            }}>
              <img 
                src={gifticonThumbnailPath || gifticonOriginalPath} 
                alt="기프티콘 썸네일" 
                style={{ 
                  width: '150px',
                  height: 'auto',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error('썸네일 이미지 로드 실패:', e);
                  if (e.target.src.includes('fallback-image.png')) {
                    e.target.onerror = null;
                    return;
                  }
                  
                  if (e.target.src !== gifticonOriginalPath && gifticonOriginalPath) {
                    e.target.src = gifticonOriginalPath;
                    e.target.onerror = (e2) => {
                      console.error('원본 이미지도 로드 실패:', e2);
                      e2.target.src = "/fallback-image.png";
                      e2.target.onerror = null;
                    };
                  } else {
                    e.target.src = "/fallback-image.png";
                    e.target.onerror = null;
                  }
                }}
              />
            </div>
            
            {/* 갤러리에 저장 버튼 */}
            <button 
              onClick={handleSaveImage} 
              style={{ 
                backgroundColor: '#E8F4FC',
                color: '#3669A1',
                fontWeight: '500',
                padding: '12px',
                borderRadius: '8px',
                width: '100%',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              갤러리에 저장
            </button>
          </div>

          {/* 유효기간 정보 - 검정색 배경(40% 불투명도)과 시계 아이콘 */}
          {expiryDateTime && (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              margin: '15px auto',
              width: '60%',
              textAlign: 'center'
            }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{ width: '18px', height: '18px', marginRight: '6px' }}
              >
                <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33243 5.11383 5.86492 6.86543L8 9H2V3L4.44656 5.44648C6.28002 3.33509 8.9841 2 12 2ZM13 7L12.9998 11.585L16.2426 14.8284L14.8284 16.2426L10.9998 12.413L11 7H13Z"></path>
              </svg>
              <span style={{ fontSize: '14px' }}>{expiryDateTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PresentCard;

