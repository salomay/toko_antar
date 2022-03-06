import { BaseService } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';

export type VerifyCouponInputType = {
  code: string;
};

class Coupon extends BaseService {
  verifyCoupon(input: VerifyCouponInputType) {
    return this.http
      .post(this.basePath + '/verify', input)
      .then((res) => res.data);
  }
}
export const couponService = new Coupon(API_ENDPOINTS.COUPONS);
