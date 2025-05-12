import apiClient from './apiClient';
import { API_CONFIG } from './config';

// 쉐어박스 목록 조회 API
export const fetchShareBoxes = async ({ sort = 'CREATED_ASC,NAME_ASC', page, size = 6 } = {}) => {
  const params = { sort, size };
  if (page) params.page = page;
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.SHARE_BOXES, { params });
  return response.data;
};

// 쉐어박스 생성 API
export const createShareBox = async (shareBoxName) => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.CREATE_SHARE_BOX, {
    shareBoxName,
  });
  return response.data;
};

// 쉐어박스 참여(초대코드 입력) API
export const joinShareBox = async (shareBoxId, inviteCode) => {
  const response = await apiClient.post(
    API_CONFIG.ENDPOINTS.JOIN_SHARE_BOX(shareBoxId),
    { shareBoxInviteCode: inviteCode }
  );
  return response.data;
};

// 쉐어박스 나가기 API
export const leaveShareBox = async (shareBoxId) => {
  const res = await apiClient.delete(`/api/share-boxes/${shareBoxId}/leave`);
  return res.data;
}; 