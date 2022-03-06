import {
  QueryParamsType,
  ShopsQueryOptionsType,
  Shop,
  PaginatorInfo,
} from '@framework/types';
import { BaseService, RequestParams } from '@framework/utils/base-service';
import { mapPaginatorData } from '@framework/utils/data-mappers';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
} from 'react-query';
class ShopService extends BaseService {}
const shopService = new ShopService(API_ENDPOINTS.SHOPS);
type PaginatedShop = {
  data: Shop[];
  paginatorInfo: PaginatorInfo;
};
const fetchShops = async ({
  queryKey,
  pageParam,
}: QueryParamsType): Promise<PaginatedShop> => {
  const params = queryKey[1] as RequestParams;
  let fetchedData: any = {};
  if (pageParam) {
    fetchedData = await shopService.get(pageParam);
  } else {
    fetchedData = await shopService.find(params);
  }
  const { data, ...rest } = fetchedData;
  return { data, paginatorInfo: mapPaginatorData({ ...rest }) };
};

const useShopsQuery = (
  params: ShopsQueryOptionsType = {},
  options?: UseInfiniteQueryOptions<
    PaginatedShop,
    Error,
    PaginatedShop,
    PaginatedShop,
    QueryKey
  >
) => {
  return useInfiniteQuery<PaginatedShop, Error>(
    [API_ENDPOINTS.SHOPS, params],
    fetchShops,
    {
      ...options,
      getNextPageParam: ({ paginatorInfo }) => paginatorInfo.nextPageUrl,
    }
  );
};

export { useShopsQuery, fetchShops };

export const fetchShop = (slug: string) => {
  return shopService.findOne(slug);
};

export const useShopQuery = (slug: string) => {
  return useQuery<Shop, Error>([API_ENDPOINTS.SHOPS, slug], () =>
    fetchShop(slug)
  );
};
