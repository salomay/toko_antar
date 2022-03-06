import { Type } from '@framework/types';
import { BaseService } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useQuery } from 'react-query';

class GroupService extends BaseService {}
const groupService = new GroupService(API_ENDPOINTS.TYPE);
export const fetchGroups = async () => {
  const { data } = await groupService.findAll();
  return { types: data as Type[] };
};
export const useGroupsQuery = () => {
  return useQuery<{ types: Type[] }, Error>(API_ENDPOINTS.TYPE, fetchGroups);
};

export const fetchGroup = async (slug: string) => {
  const data = await groupService.findOne(slug);
  return { type: data };
};
export const useGroupQuery = (slug: string) => {
  return useQuery<{ type: Type }, Error>(
    [API_ENDPOINTS.TYPE, slug],
    () => fetchGroup(slug),
    { enabled: Boolean(slug) }
  );
};
