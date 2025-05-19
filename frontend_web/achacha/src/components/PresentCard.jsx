import React, { useState, useRef, useEffect } from 'react';

// SCSS 변수값에 해당하는 상수 정의
const colorEnv = '#0077B2';
const colorEnv2 = '#006A9E'; // darken($color-env, 3%)
const colorFlap = '#004466'; // darken($color-env, 20%)
const colorBg = '#C0E5F5';   // lighten($color-env, 48%)
const colorHeart = '#D00000';

const envBorderRadius = '6px';
const envWidth = '280px';
const envHeight = '180px';
const heartWidth = '50px';

const halfEnvWidth = '140px'; // $env-width / 2
const halfEnvHeight = '90px'; // $env-height / 2
const flapBorderBottomWidth = 'calc(180px / 2 - 8px)'; // calc(${halfEnvHeight} - 8px) -> 82px
const flapBorderTopWidth = 'calc(180px / 2 + 8px)';    // calc(${halfEnvHeight} + 8px) -> 98px
const letterTransformY = '-60px'; // -(180px / 3)

function PresentCard({ presentCard }) {
  // 애니메이션 상태
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  // 기존 PresentCard 상태
  const [showFullMessage, setShowFullMessage] = useState(false);
  const messageRef = useRef(null);
  const [isLongMessage, setIsLongMessage] = useState(false);

  // 애니메이션 로직
  useEffect(() => {
    const openTimer = setTimeout(() => {
      setIsEnvelopeOpen(true);
    }, 100); // 약간의 딜레이 후 열기 시작

    const switchTimer = setTimeout(() => {
      setShowEnvelope(false);
    }, 3500); // 3.5초 후 카드 내용 표시

    return () => {
      clearTimeout(openTimer);
      clearTimeout(switchTimer);
    };
  }, []);

  // 메시지 길이 감지 로직
  useEffect(() => {
    if (!showEnvelope && messageRef.current && presentCard?.presentCardMessage) {
      const lineHeight = parseInt(getComputedStyle(messageRef.current).lineHeight, 10) || 24;
      const messageHeight = messageRef.current.clientHeight;
      const lines = messageHeight / lineHeight;
      setIsLongMessage(lines > 3);
    }
  }, [showEnvelope, presentCard?.presentCardMessage, showFullMessage]); // showFullMessage 추가하여 모달 닫힐 때 재계산

  // 편지봉투 애니메이션 JSX
  if (showEnvelope) {
    return (
      <>
        <style>{`
          /* Envelope specific styles */
          .envelope-container {
            font-family: 'Pretendard', sans-serif;
            background-color: ${colorBg}; /* $color-bg */
          }
          #envelope {
            position: relative;
            width: ${envWidth};
            height: ${envHeight};
            border-bottom-left-radius: ${envBorderRadius};
            border-bottom-right-radius: ${envBorderRadius};
            margin-left: auto;
            margin-right: auto;
            top: 150px;
            background-color: ${colorFlap}; /* $color-flap */
            box-shadow: 0 4px 20px rgba(0,0,0,.2);
          }
          .front { 
            position: absolute;
            width: 0;
            height: 0;
            z-index: 30;
          }
          .flap {
            border-left: ${halfEnvWidth} solid transparent;
            border-right: ${halfEnvWidth} solid transparent;
            border-bottom: ${flapBorderBottomWidth} solid transparent;
            border-top: ${flapBorderTopWidth} solid ${colorFlap}; /* $color-flap */
            transform-origin: top;
            pointer-events: none;
          }
          .pocket {
            border-left: ${halfEnvWidth} solid ${colorEnv}; /* $color-env */
            border-right: ${halfEnvWidth} solid ${colorEnv}; /* $color-env */
            border-bottom: ${halfEnvHeight} solid ${colorEnv2}; /* $color-env2 */
            border-top: ${halfEnvHeight} solid transparent;
            border-bottom-left-radius: ${envBorderRadius};
            border-bottom-right-radius: ${envBorderRadius};
          }
          .letter {
            position: relative;
            background-color: #fff;
            width: 90%;
            margin-left: auto;
            margin-right: auto;
            height: 90%;
            top: 5%;
            border-radius: ${envBorderRadius};
            box-shadow: 0 2px 26px rgba(0,0,0,.12);
          }
          .letter:after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-image: 
                linear-gradient(180deg, 
                rgba(255,255,255,0.00) 25%, 
                rgba(215,227,239,0.70) 55%, 
                rgba(215,227,239,1.00) 100%);
          }
          .words {
            position: absolute;
            left: 10%;
            width: 80%;
            height: 14%;
            background-color: #EEEFF0;
          }
          .words.line1 { top: 15%; width: 20%; height: 7%; }
          .words.line2 { top: 30%; }
          .words.line3 { top: 50%; }
          .words.line4 { top: 70%; }

          #envelope.open .flap {
            transform: rotateX(180deg);
            transition: transform .4s ease, z-index .6s;
            z-index: 10;
          }
          #envelope.close .flap {
            transform: rotateX(0deg);
            transition: transform .4s .6s ease, z-index 1s;
            z-index: 50;
          }
          #envelope.close .letter {
            transform: translateY(0px); 
            transition: transform .4s ease, z-index 1s;
            z-index: 10;
          }
          #envelope.open .letter {
            transform: translateY(${letterTransformY});
            transition: transform .4s .6s ease, z-index .6s;
            z-index: 20;
          }
          .hearts {
            position: absolute;
            top: ${halfEnvHeight};
            left: 0;
            right: 0;
            z-index: 20;
          }
          .heart {
            position: absolute;
            bottom: 0;
            right: 10%;
            pointer-events: none;
          }
          .heart:before,
          .heart:after {
            position: absolute;
            content: "";
            left: ${heartWidth};
            top: 0;
            width: ${heartWidth};
            height: calc(${heartWidth} * 1.6); /* 80px */
            background: ${colorHeart}; /* $color-heart */
            border-radius: ${heartWidth} ${heartWidth} 0 0;
            transform: rotate(-45deg);
            transform-origin: 0 100%;
          }
          .heart:after {
            left: 0;
            transform: rotate(45deg);
            transform-origin: 100% 100%;
          }
          #envelope.close .heart {
            opacity: 0;
            animation: none;
          }
          #envelope.open .heart.a1 {
            left: 20%;
            transform: scale(0.6);
            opacity: 1;
            animation: одиночнаяАнимацияПодъема 4s linear 1, анимацияПокачивания 2s ease-in-out 4 alternate; /* Renamed for clarity */
            animation-fill-mode: forwards;
            animation-delay: .7s;
          }
          #envelope.open .heart.a2 {
            left: 55%;
            transform: scale(1);
            opacity: 1;
            animation: одиночнаяАнимацияПодъема 5s linear 1, анимацияПокачивания 4s ease-in-out 2 alternate;
            animation-fill-mode: forwards;
            animation-delay: .7s;
          }
          #envelope.open .heart.a3 {
            left: 10%;
            transform: scale(0.8);
            opacity: 1;
            animation: одиночнаяАнимацияПодъема 7s linear 1, анимацияПокачивания 2s ease-in-out 6 alternate; 
            animation-fill-mode: forwards;
            animation-delay: .7s;
          }

          @keyframes одиночнаяАнимацияПодъема { /* slideUp */
              0% { top: 0; }
              100% { top: -600px; }
          }
          @keyframes анимацияПокачивания { /* sideSway */
              0% { margin-left: 0px; }
              100% { margin-left: 50px; }
          }
        `}</style>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 envelope-container">
          <div className="envlope-wrapper h-[380px]"> {/* Approx envHeight + 200px */}
              <div id="envelope" className={isEnvelopeOpen ? 'open' : 'close'}>
                  <div className="front flap"></div>
                  <div className="front pocket"></div>
                  <div className="letter">
                      <div className="words line1"></div>
                      <div className="words line2"></div>
                      <div className="words line3"></div>
                      <div className="words line4"></div>
                  </div>
                  <div className="hearts">
                      <div className="heart a1"></div>
                      <div className="heart a2"></div>
                      <div className="heart a3"></div>
                  </div>
              </div>
          </div>
        </div>
      </>
    );
  }

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100" style={{ fontFamily: 'Pretendard, sans-serif' }}>
      {/* 전체 카드 컨테이너 */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        {/* 템플릿 이미지 (배경) */}
        <img 
          src={templateCardPath} 
          alt="템플릿 카드" 
          style={{ 
            width: '100%', 
            display: 'block',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }} 
        />
        
        {/* 컨텐츠 오버레이 */}
        <div style={{ 
          position: 'absolute', 
          top: 145, 
          left: '50%', 
          width: '90%', 
          height: 'auto',
          minHeight: '80%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: 'translateX(-50%)'
        }}>
          {/* 메시지 영역 */}
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px',
              padding: '20px',
              width: '80%',
              marginTop: '5%',
              marginBottom: '10px',
              textAlign: 'center',
              height: '90px',
              minHeight: '90px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflowY: isLongMessage && !showFullMessage ? 'hidden' : 'auto',
              cursor: isLongMessage ? 'pointer' : 'default',
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Pretendard, sans-serif'
            }}
            onClick={() => isLongMessage && setShowFullMessage(true)}
          >
            <p 
              ref={messageRef}
              style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#000',
                margin: 0,
                wordBreak: 'break-word'
              }}
            >
              {displayMessage.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < displayMessage.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
            {isLongMessage && !showFullMessage && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '30px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
                pointerEvents: 'none'
              }}></div>
            )}
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
            padding: '10px',
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
              padding: '2px',
              marginBottom: '10px'
            }}>
              <img 
                src={gifticonThumbnailPath || gifticonOriginalPath} 
                alt="기프티콘 썸네일" 
                style={{ 
                  width: '80px',
                  height: 'auto',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error('썸네일 이미지 로드 실패:', e);
                  if (e.target.src.includes('fallback-image.png')) {
                    e.target.onerror = null;
                    return;
                  }
                  
                  if (gifticonOriginalPath && e.target.src !== gifticonOriginalPath) {
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
                height: '35px',
                width: '90%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Pretendard, sans-serif'
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
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              margin: '15px auto',
              width: '60%',
              textAlign: 'center',
              fontFamily: 'Pretendard, sans-serif'
            }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  marginRight: '6px',
                  verticalAlign: 'middle',
                  position: 'relative',
                  top: '-1px'
                }}
              >
                <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33243 5.11383 5.86492 6.86543L8 9H2V3L4.44656 5.44648C6.28002 3.33509 8.9841 2 12 2ZM13 7L12.9998 11.585L16.2426 14.8284L14.8284 16.2426L10.9998 12.413L11 7H13Z"></path>
              </svg>
              <span style={{ 
                fontSize: '14px',
                display: 'inline-block',
                verticalAlign: 'middle',
                lineHeight: '18px',
                fontWeight: '400'
              }}>{expiryDateTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* 전체 메시지 오버레이 */}
      {showFullMessage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            fontFamily: 'Pretendard, sans-serif'
          }}
          onClick={() => setShowFullMessage(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80%',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: '700', fontSize: '20px', marginBottom: '20px' }}>메시지 전체보기</h3>
            <p style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              lineHeight: '1.6',
              wordBreak: 'break-word'
            }}>
              {displayMessage.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < displayMessage.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresentCard;

