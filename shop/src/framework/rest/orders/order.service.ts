import { BaseService } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';

export type VerifyCheckoutInputType = {
  amount: number;
  products: any[];
  billing_address: any;
  shipping_address: any;
};

class OrderService extends BaseService {
  verifyCheckout(input: VerifyCheckoutInputType) {
    return this.http
      .post(API_ENDPOINTS.VERIFY_CHECKOUT, input)
      .then((res) => res.data);
  }
}
export const orderService = new OrderService(API_ENDPOINTS.ORDERS);
