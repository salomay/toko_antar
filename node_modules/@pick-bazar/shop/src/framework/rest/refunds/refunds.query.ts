import {
  OrdersQueryOptionsType,
  PaginatorInfo,
  QueryParamsType,
  Refund,
} from '@framework/types';
import { RequestParams } from '@framework/utils/base-service';
import { mapPaginatorData } from '@framework/utils/data-mappers';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
} from 'react-query';
import { refundService } from './refunds.service';

type RefundPaginator = {
  data: Refund[];
  paginatorInfo: PaginatorInfo;
};
async function fetchRefunds({
  queryKey,
  pageParam,
}: QueryParamsType): Promise<RefundPaginator> {
  const params = queryKey[1] as RequestParams;
  let fetchedData: any = {};
  if (pageParam) {
    fetchedData = await refundService.get(pageParam);
  } else {
    fetchedData = await refundService.find(params);
  }
  const { data, ...rest } = fetchedData;
  return { data, paginatorInfo: mapPaginatorData({ ...rest }) };
}

export const useRefundsQuery = (
  params?: OrdersQueryOptionsType,
  options?: UseInfiniteQueryOptions<
    RefundPaginator,
    Error,
    RefundPaginator,
    RefundPaginator,
    QueryKey
  >
) => {
  return useInfiniteQuery<RefundPaginator, Error>(
    [API_ENDPOINTS.REFUNDS, params],
    fetchRefunds,
    {
      ...options,
      getNextPageParam: ({ paginatorInfo }) => paginatorInfo.nextPageUrl,
    }
  );
};

type RefundCreateInputType = {
  order_id: string;
  title: string;
  description: string;
  images?: string[];
};

export const useCreateRefundMutation = () => {
  return useMutation((input: RefundCreateInputType) =>
    refundService.create(input)
  );
};
