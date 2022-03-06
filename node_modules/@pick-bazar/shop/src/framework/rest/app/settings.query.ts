import { BaseService } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useQuery } from 'react-query';
import { SettingsType } from '@framework/types';

class SettingsService extends BaseService {}
const settingsService = new SettingsService(API_ENDPOINTS.SETTINGS);

export const fetchSettings = async () => {
  const { data } = await settingsService.findAll();
  return { settings: data };
};
type SettingsResponse = {
  settings: SettingsType;
};
export const useSettingsQuery = () => {
  return useQuery<SettingsResponse, Error>(
    API_ENDPOINTS.SETTINGS,
    fetchSettings
  );
};
