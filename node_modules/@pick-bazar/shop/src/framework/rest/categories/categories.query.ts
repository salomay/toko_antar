import {
  CategoriesQueryOptionsType,
  Category,
  QueryParamsType,
} from '@framework/types';
import { BaseService, RequestParams } from '@framework/utils/base-service';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useQuery } from 'react-query';

class CategoryService extends BaseService {}
const categoryService = new CategoryService(API_ENDPOINTS.CATEGORIES);
export const fetchCategories = async ({ queryKey }: QueryParamsType) => {
  const params = queryKey[1] as RequestParams;
  const { data } = await categoryService.find(params);
  return { categories: { data } };
};
export const useCategoriesQuery = (options: CategoriesQueryOptionsType) => {
  return useQuery<{ categories: { data: Category[] } }, Error>(
    [API_ENDPOINTS.CATEGORIES, options],
    fetchCategories
  );
};
