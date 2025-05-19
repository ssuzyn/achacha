import axios from 'axios';

const API_URL = '/api/presents/cards'; // API 기본 URL, 필요에 따라 수정하세요.

export const getPresentCardByCode = async (presentCardCode) => {
  try {
    const response = await axios.get(`${API_URL}/${presentCardCode}`);
    // API 응답을 그대로 반환 (어떤 변환도 수행하지 않음)
    console.log('API로부터 받은 원본 데이터:', response.data);
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
