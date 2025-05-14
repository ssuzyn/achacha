import apiClient from './apiClient';
import { API_CONFIG } from './config';

// userId로 사용자 정보 조회
export const fetchUserById = async (userId) => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_INFO(userId));
  return response.data;
}; 