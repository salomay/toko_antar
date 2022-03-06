import { Coupon, QueryParamsType } from '@framework/types';
import { RequestParams } from '@framework/utils/base-service';
import { mapPaginatorData } from '@framework/utils/data-mappers';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useInfiniteQuery, useMutation } from 'react-query';
import { couponService, VerifyCouponInputType } from './coupon.service';

export const fetchCoupons = async ({
  queryKey,
  pageParam,
}: QueryParamsType) => {
  const params = queryKey[1] as RequestParams;
  let fetchedData: any = {};
  if (pageParam) {
    fetchedData = await couponService.get(pageParam);
  } else {
    fetchedData = await couponService.find(params);
  }

  const { data, ...rest } = fetchedData;
  return { data, paginatorInfo: mapPaginatorData({ ...rest }) };
};

export const useCouponsQuery = (options: any = { limit: 15 }) => {
  return useInfiniteQuery<{ data: Coupon[]; paginatorInfo: any }, Error>(
    [API_ENDPOINTS.COUPONS, options],
    fetchCoupons,
    {
      getNextPageParam: ({ paginatorInfo }) => paginatorInfo.nextPageUrl,
    }
  );
};

export const useVerifyCouponMutation = () => {
  return useMutation((input: VerifyCouponInputType) =>
    couponService.verifyCoupon(input)
  );
};
