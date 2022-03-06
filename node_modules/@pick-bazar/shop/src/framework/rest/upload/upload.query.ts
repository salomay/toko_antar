import { BaseService } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useMutation } from 'react-query';

class UploadService extends BaseService {}
const uploadService = new UploadService(API_ENDPOINTS.UPLOAD);

export const useUploadMutation = () => {
  return useMutation((input: any) => {
    let formData = new FormData();
    input.forEach((attachment: any) => {
      formData.append('attachment[]', attachment);
    });
    return uploadService.create(formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  });
};
