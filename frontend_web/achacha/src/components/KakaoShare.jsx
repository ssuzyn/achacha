// KakaoShare.jsx
import React, { useEffect } from 'react';

const KAKAO_JS_KEY = '8d54c485f1e1360ca3124ebb9f3978ab'; // 본인 JS 키로 변경
const TEMPLATE_ID = 12345; // 본인 템플릿 ID로 변경

const KakaoShare = () => {
  useEffect(() => {
    // Kakao SDK 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
      sendKakaoLink();
    };
    document.body.appendChild(script);

    function sendKakaoLink() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (window.Kakao && window.Kakao.Link) {
        window.Kakao.Link.sendCustom({
          templateId: TEMPLATE_ID,
          templateArgs: {
            invite_code: code,
          },
        });
      }
    }

    // cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <p>카카오톡 공유창을 여는 중입니다...</p>
    </div>
  );
};

export default KakaoShare;