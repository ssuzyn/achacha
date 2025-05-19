import axios from 'axios';

const API_URL = '/api/presents/cards'; // API 기본 URL, 필요에 따라 수정하세요.

export const getPresentCardByCode = async (presentCardCode) => {
  try {
    const response = await axios.get(`${API_URL}/${presentCardCode}`);
    
    // API 응답 데이터 구조 확인
    const {
      presentCardCode: code,
      presentCardMessage: message,
      gifticonOriginalPath,
      gifticonThumbnailPath,
      templateCardPath,
      expiryDateTime
    } = response.data;

    // templateCardPath에서 템플릿 정보 추출
    const fileName = templateCardPath ? templateCardPath.substring(templateCardPath.lastIndexOf('/') + 1) : '';
    const isGeneralTemplate = fileName.toLowerCase().startsWith('general_');
    
    // GENERAL 템플릿인 경우 색상 코드 추출
    let colorCode = 'transparent';
    if (isGeneralTemplate) {
      const parts = fileName.split('_');
      if (parts.length > 1) {
        colorCode = parts[1].split('.')[0]; // e.g., "FFDC4F"
      }
    }

    // PresentCard 컴포넌트가 기대하는 형태로 데이터 구조화
    return {
      template: {
        category: isGeneralTemplate ? 'GENERAL' : 'CUSTOM',
        templateImageUrl: !isGeneralTemplate ? templateCardPath : null
      },
      color: {
        code: isGeneralTemplate ? `#${colorCode}` : 'transparent'
      },
      message: message,
      gifticon: {
        imageUrl: gifticonOriginalPath,
        thumbnailUrl: gifticonThumbnailPath,
        name: '선물 이미지' // API 응답에 기프티콘 이름이 있다면 추가
      },
      expiryDateTime: expiryDateTime
    };
  } catch (error) {
    if (error.response) {
      // 서버에서 응답이 왔지만 에러인 경우
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || '선물카드를 불러오는데 실패했습니다.');
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('Network Error:', error.request);
      throw new Error('서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.');
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('Error:', error.message);
      throw new Error('요청을 처리하는 중 오류가 발생했습니다.');
    }
  }
};
