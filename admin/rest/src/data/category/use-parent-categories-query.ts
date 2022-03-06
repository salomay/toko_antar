import {
    QueryParamsType,
    CategoriesQueryOptionsType,
  } from "@ts-types/custom.types";
  import { useQuery } from "react-query";
  import Category from "@repositories/category";
  import { API_ENDPOINTS } from "@utils/api/endpoints";
  import { parentCategories as TParenCategories } from "@ts-types/generated";
  
  const fetchParentCategories = async ({queryKey,}: QueryParamsType) => {
    const [_key, params] = queryKey;
  
  
    const url = `${API_ENDPOINTS.CATEGORIES}?id_sub_categories=${params.text}`;
  
    const { data} = await Category.all(url);
  
    return { data_parent: data as TParenCategories[] };
  };

  type TypeResponse = {
    data_parent: TParenCategories[];
  };

  
  const useParentCategoriesQuery = (options: CategoriesQueryOptionsType) => {
  
    return useQuery<TypeResponse, Error>(
      [API_ENDPOINTS.CATEGORIES, options],
      fetchParentCategories,
      {
        keepPreviousData: true,
      }
    );
  };
  
  export { useParentCategoriesQuery, fetchParentCategories };
  