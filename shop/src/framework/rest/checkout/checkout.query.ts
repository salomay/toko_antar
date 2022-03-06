import {
  orderService,
  VerifyCheckoutInputType,
} from '@framework/orders/order.service';
import { useMutation } from 'react-query';

export const useVerifyCheckoutMutation = () => {
  return useMutation((input: VerifyCheckoutInputType) =>
    orderService.verifyCheckout(input)
  );
};
