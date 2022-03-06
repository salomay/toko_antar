import {
  QueryParamsType,
  Order,
  OrdersQueryOptionsType,
  PaginatorInfo,
} from '@framework/types';
import { RequestParams } from '@framework/utils/base-service';
import { mapPaginatorData } from '@framework/utils/data-mappers';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
} from 'react-query';
import { orderService } from './order.service';
type PaginatedOrder = {
  data: Order[];
  paginatorInfo: PaginatorInfo;
};
const fetchOrders = async ({
  queryKey,
  pageParam,
}: QueryParamsType): Promise<PaginatedOrder> => {
  const params = queryKey[1] as RequestParams;
  let fetchedData: any = {};
  if (pageParam) {
    fetchedData = await orderService.get(pageParam);
  } else {
    fetchedData = await orderService.find(params);
  }
  const { data, ...rest } = fetchedData;
  return { data, paginatorInfo: mapPaginatorData({ ...rest }) };
};

const useOrdersQuery = (
  params?: OrdersQueryOptionsType,
  options?: UseInfiniteQueryOptions<
    PaginatedOrder,
    Error,
    PaginatedOrder,
    PaginatedOrder,
    QueryKey
  >
) => {
  return useInfiniteQuery<PaginatedOrder, Error>(
    [API_ENDPOINTS.ORDERS, params],
    fetchOrders,
    {
      ...options,
      getNextPageParam: ({ paginatorInfo }) => paginatorInfo.nextPageUrl,
    }
  );
};

export { useOrdersQuery, fetchOrders };

export const fetchOrder = async (trackingNumber: string) => {
  const data = await orderService.findOne(
    `${API_ENDPOINTS.ORDER_TRACKING_NUMBER}/${trackingNumber}?with=wallet_point`
  );
  return {
    order: data,
  };
};
export const useOrderQuery = ({
  tracking_number,
}: {
  tracking_number: string;
}) => {
  return useQuery<{ order: Order }, Error>(['order', tracking_number], () =>
    fetchOrder(tracking_number)
  );
};

export const fetchOrderStatuses = async () => {
  //@ts-ignore
  const { data, ...rest } = await orderService.get(API_ENDPOINTS.ORDER_STATUS);
  return {
    order_statuses: { data, paginatorInfo: mapPaginatorData({ ...rest }) },
  };
};
export const useOrderStatusesQuery = () => {
  return useQuery<any, Error>(API_ENDPOINTS.ORDER_STATUS, fetchOrderStatuses);
};

type OrderCreateInputType = {
  [key: string]: unknown;
};

export const useCreateOrderMutation = () => {
  return useMutation((input: OrderCreateInputType) =>
    orderService.create(input)
  );
};
