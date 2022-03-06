import { BaseService } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';

class RefundService extends BaseService {}
export const refundService = new RefundService(API_ENDPOINTS.REFUNDS);
