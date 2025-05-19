import axios from 'axios';

const API_URL = '/api/presents/cards'; // API 기본 URL, 필요에 따라 수정하세요.

export const getPresentCardByCode = async (presentCardCode) => {
  try {
    const response = await axios.get(`${API_URL}/${presentCardCode}`);
    return response.data;
  } catch (error) {
    // 24시간 만료 등의 예외 처리를 여기서 수행하거나, 호출하는 쪽에서 처리할 수 있습니다.
    // 예를 들어, error.response.status 를 확인하여 특정 상태 코드에 따른 처리를 할 수 있습니다.
    console.error('Error fetching present card:', error);
    throw error; // 오류를 다시 throw하여 호출하는 쪽에서 처리하도록 합니다.
  }
};
