import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // react-router-dom이 설치되어 있어야 합니다.
import { getPresentCardByCode } from '../api/PresentApi';
import PresentCard from '../components/PresentCard';

function PresentPage() {
  const { presentCardCode } = useParams(); // URL에서 presentCardCode 추출
  const [presentCardData, setPresentCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (presentCardCode) {
      const fetchPresentCard = async () => {
        try {
          setLoading(true);
          console.log(`PresentPage: presentCardCode=${presentCardCode} 데이터 요청 시작`);
          
          const data = await getPresentCardByCode(presentCardCode);
          
          // HTML 응답 체크
          if (typeof data === 'string' && data.includes('<!doctype html>')) {
            console.error('PresentPage: API가 HTML을 반환했습니다');
            throw new Error('API가 HTML을 반환했습니다. 서버 설정을 확인하세요.');
          }
          
          console.log('PresentPage: API 응답 데이터 수신 완료', data);
          
          // 데이터 검증
          if (!data) {
            throw new Error('API 응답에 데이터가 없습니다.');
          }
          
          // 필수 필드 확인
          const requiredFields = ['presentCardMessage', 'gifticonOriginalPath', 'templateCardPath'];
          const missingFields = requiredFields.filter(field => !data[field]);
          
          if (missingFields.length > 0) {
            console.warn(`PresentPage: API 응답에 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
          }
          
          setPresentCardData(data);
          setError(null);
        } catch (err) {
          console.error('PresentPage: 선물 카드 데이터 요청 실패:', err);
          
          // 사용자 친화적인 오류 메시지
          let errorMessage = '선물 카드를 불러오는 데 실패했습니다.';
          
          if (err.message.includes('HTML')) {
            errorMessage = 'API 서버 구성 오류: HTML 응답이 반환되었습니다. 관리자에게 문의하세요.';
          } else if (err.message.includes('Network Error')) {
            errorMessage = '네트워크 오류: 서버에 연결할 수 없습니다. 인터넷 연결을 확인하세요.';
          } else if (err.response?.status === 404) {
            errorMessage = '선물 카드를 찾을 수 없습니다. 링크가 만료되었거나 유효하지 않습니다.';
          }
          
          setError(errorMessage);
          setPresentCardData(null);
        }
        setLoading(false);
      };

      fetchPresentCard();
    } else {
      console.error('PresentPage: presentCardCode가 없습니다.');
      setError('유효하지 않은 선물 카드 코드입니다.');
      setLoading(false);
    }
  }, [presentCardCode]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">로딩 중...</div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-screen text-red-500 text-center">
      <p className="text-2xl mb-4">오류</p>
      <p>{error}</p>
      <p className="mt-2 text-sm text-gray-600">선물 링크를 다시 확인해주세요.</p>
      </div>;
  }

  if (!presentCardData) {
    // 이 경우는 일반적으로 error 상태에서 처리되지만, 만약을 위해 추가
    return <div className="flex justify-center items-center h-screen">선물 카드 정보를 찾을 수 없습니다.</div>;
  }

  // API로부터 받은 데이터 그대로 PresentCard 컴포넌트에 전달
  return <PresentCard presentCard={presentCardData} />;
}

export default PresentPage;
