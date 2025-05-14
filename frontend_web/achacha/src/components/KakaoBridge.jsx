// KakaoBridge.jsx
import React, { useEffect } from 'react';

const KakaoBridge = () => {
  useEffect(() => {
    // URL에서 code 파라미터 추출
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    // 딥링크 호출
    window.location.href = `achacha://sharebox?code=${code}`;

    // 2초 후 앱스토어로 이동 (앱 미설치 시)
    const timer = setTimeout(() => {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.koup28.achacha_app';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <p>앱으로 이동 중입니다...</p>
    </div>
  );
};

export default KakaoBridge;