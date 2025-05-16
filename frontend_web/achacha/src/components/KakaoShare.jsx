import React, { useEffect, useState } from 'react';

const KAKAO_JS_KEY = '8d54c485f1e1360ca3124ebb9f3978ab';
const TEMPLATE_ID = 120597;

const KakaoShare = () => {
  const [status, setStatus] = useState('loading');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    // 초대 코드 추출
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (!code) {
      setStatus('error');
      return;
    }
    
    setInviteCode(code);
    
    // Kakao SDK 로드
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
        console.log('Kakao SDK 초기화:', window.Kakao.isInitialized());
      }
      
      // 초기화 완료 후 바로 공유 실행
      shareToKakao(code);
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const shareToKakao = (code) => {
    if (!window.Kakao) {
      setStatus('error');
      return;
    }
    
    try {
      // 최신 API 사용
      if (window.Kakao.Share) {
        window.Kakao.Share.sendCustom({
          templateId: TEMPLATE_ID,
          templateArgs: {
            invite_code: code,
          },
        });
        setStatus('success');
      } else if (window.Kakao.Link) {
        // 구버전 API 대응
        window.Kakao.Link.sendCustom({
          templateId: TEMPLATE_ID,
          templateArgs: {
            invite_code: code,
          },
        });
        
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('카카오 공유 에러:', error);
      setStatus('error');
    }
  };
  
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      {status === 'loading' && (
        <p>카카오톡 공유를 준비하는 중입니다...</p>
      )}
      
      {status === 'success' && (
        <>
          <h2>공유가 시작되었습니다!</h2>
          <p>카카오톡 앱이 열리지 않았다면 아래 버튼을 눌러주세요.</p>
          <button 
            onClick={() => shareToKakao(inviteCode)}
            style={{
              background: '#FEE500',
              color: '#000000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              marginTop: '15px',
              cursor: 'pointer'
            }}
          >
            다시 공유하기
          </button>
        </>
      )}
      
      {status === 'need-app' && (
        <>
          <h2>카카오톡 앱이 필요합니다</h2>
          <p>아래 버튼을 눌러 공유하거나 카카오톡을 설치해주세요.</p>
          
          {/* 카카오 웹 공유 버튼이 여기에 생성됨 */}
          <div id="kakao-share-container" style={{ marginTop: '20px' }}></div>
          
          <a 
            href="https://play.google.com/store/apps/details?id=com.kakao.talk"
            style={{
              display: 'block',
              marginTop: '20px',
              color: '#007BFF',
              textDecoration: 'underline'
            }}
          >
            카카오톡 설치하기
          </a>
        </>
      )}
      
      {status === 'error' && (
        <>
          <h2>오류가 발생했습니다</h2>
          <p>카카오톡 공유를 시작할 수 없습니다.</p>
          <p>초대 코드: {inviteCode || '코드 없음'}</p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: '#007BFF',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              marginTop: '15px',
              cursor: 'pointer'
            }}
          >
            뒤로 가기
          </button>
        </>
      )}
    </div>
  );
};

export default KakaoShare;