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
          const data = await getPresentCardByCode(presentCardCode);
          setPresentCardData(data);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch present card:', err);
          setError(err.response?.data?.message || err.message || '선물 카드를 불러오는 데 실패했습니다. 링크가 만료되었거나 유효하지 않을 수 있습니다.');
          setPresentCardData(null);
        }
        setLoading(false);
      };

      fetchPresentCard();
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

  return <PresentCard presentCard={presentCardData} />;
}

export default PresentPage;
