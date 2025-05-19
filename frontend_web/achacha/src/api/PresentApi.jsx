import axios from 'axios';

const API_URL = '/api/presents/cards'; // API 기본 URL, 필요에 따라 수정하세요.

export const getPresentCardByCode = async (presentCardCode) => {
  try {
    console.log(`API 호출 시작: ${API_URL}/${presentCardCode}`);
    const response = await axios.get(`${API_URL}/${presentCardCode}`);
    // API 응답을 그대로 반환 (어떤 변환도 수행하지 않음)
    console.log('API 호출 성공! 받은 원본 데이터:', response.data);
    
    // 응답 데이터의 구조 검증
    if (response.data) {
      const requiredFields = ['presentCardCode', 'presentCardMessage', 'gifticonOriginalPath', 'templateCardPath'];
      const missingFields = requiredFields.filter(field => !response.data[field]);
      
      if (missingFields.length > 0) {
        console.warn('API 응답에 필요한 필드가 없습니다:', missingFields);
      }
    }
    
    return response.data;
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
