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

  // 테스트용 더미 데이터 추가 (사용자가 제공한 JSON)
  const dummyData = {
    "presentCardCode": "jWvDnGq7uoo0VAezB8VQPar7j4XRMF12NwAn",
    "presentCardMessage": "준수야 먹고 내 말 잘 알아들어",
    "gifticonOriginalPath": "https://d23wsj9ifltpil.cloudfront.net/images/gifticons/original/1_78ab0830-7d97-4ff4-8608-1809e95c2120.jpg?Expires=1747358426&Signature=a6A7rIgqHDN77eFz0z6LQuvrWcp3NM~-wo5CUxIIfSEHWh7uPmreocLTDu9y~ssjnZ9dC1YLnkmA~QW2ADkByUsHKi0CbGGglPJxiJSN9swrca4l8JYwBNYYxGg9a9j9OJLHBfvQ7JTCZo0FGGX~-7tCOFAB6zjg-MvAtYXZRzN87g8A-6hjvKvNouUhFxnMG~yunMmGdqLEdeV2JVCW0R1j6hwezt-JSjzAmrNMmvE8sB93M3se767pn8MVxG-tPgiJwHSH9PtaofKmFvIX88wOz2LHrQQaelshaMCqhuLz1JmT2Cfm42QRKD1eZNpx5EWMdioAufdv4sQEaFvElg__&Key-Pair-Id=K2C71U4UOF3AXL",
    "gifticonThumbnailPath": "https://d23wsj9ifltpil.cloudfront.net/images/gifticons/thumbnail/1_4fc05c55-7b73-45ed-a626-400db92f4e81.jpg?Expires=1747358426&Signature=PyY1EV5rpaKPpMv4Qc7kxH6Ahhy8vyknD0SOYut1cfqzakn9xmP9X1V78GkDxmIXC0qhVLLBo~FoCeHT7HZx-E2LsZqqtSkXHfP8JtFAwVFexWQdkXuQm8A13vjSg1~YDYkCvIT1wVHl4jOh03l34~Yh2tTc0d3uTx~YmPaP-NvXRQ7yIcyLgZ2xOWdyJWPEy7XzfgTLbmvap~TFmmzsTOn9DwCPN2XiuDOErmX89gzFAY8y5g4kYf-~riQCg9EnXCEMUYN1fSiAo58KnDrMs7mAaBzNCXktCVG6uIyNC0tQFtOq~OSWdc6wKIV3sGSJT4WXSyi7rBV8rW8RU3n3gA__&Key-Pair-Id=K2C71U4UOF3AXL",
    "templateCardPath": "https://d23wsj9ifltpil.cloudfront.net/images/present-template/card/general_FFDC4F.png?Expires=1747358426&Signature=gh4OAJ5EwAxoTB~DoFj6VAlBr8UUZlAUMCGSP6lFScdixVdZgFFDBIXxF3nwB4tTmOts2TYFpcvYmu-DRhZkKeXTVOZ9162xFLQKIUZX016EUYM9Se6S45EkAlkh4AqtVMD7VTDyl9edT0cgTbXzztaiql7OfNef7NDde1oINksKT-SVgMQEkvceirFJ8OA6sZ162gxkbJEDB0k0UUW5sqv0G76A6bewwypI8E5bfPHNzJ1H5hTb6xPv~~DvyamvnOV3RmGP5L~lzrjXRrkhsV2lyX1wC3NGMz9MHfsxyQQRz98YHFeXwJYNxvgwVmQPLQtg6qbxSVsLc1m1-ZzmQg__&Key-Pair-Id=K2C71U4UOF3AXL",
    "expiryDateTime": "2025-05-17 00:47"
  };

  // 테스트 목적으로 더미 데이터 사용 (API 응답 대신)
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">로딩 중...</div>;
  }

  if (error) {
    // 에러가 있어도 테스트를 위해 더미 데이터 사용
    console.log("API 오류 발생, 더미 데이터 사용:", error);
    return <PresentCard presentCard={dummyData} />;
  }

  // API에서 데이터를 가져온 경우, 실제 데이터 사용
  // 테스트를 위해 API 데이터 대신 더미 데이터 사용
  return <PresentCard presentCard={dummyData} />;
}

export default PresentPage;
