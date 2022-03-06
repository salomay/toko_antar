import { QueryParamsType, QueryOptionsType } from "@ts-types/custom.types";
import { stringifySearchQuery } from "@utils/data-mappers";
import { useQuery } from "react-query";
import Attribute from "@repositories/attribute";
import { API_ENDPOINTS } from "@utils/api/endpoints";

const fetchAttributes = async ({ queryKey }: QueryParamsType) => {
  const [_key, params] = queryKey;
  // const {
  //   text,
  //   orderBy = "updated_at",
  //   sortedBy = "desc",
  // } = params as QueryOptionsType;
  // const searchString = stringifySearchQuery({
  //   name: text,
  // });
  const url = `${API_ENDPOINTS.ATTRIBUTES}?product_id=${params.product_id}&orderBy=updated_at&sortedBy=desc`;


  const { data } = await Attribute.all(url);
    
  console.log(data)
  return { attributes: data };
  
};

const useAttributesQuery = (
  params: QueryOptionsType = {},
  options: any = {}
) => {
  return useQuery<any, Error>(
    [API_ENDPOINTS.ATTRIBUTES, params],
    fetchAttributes,
    {
      ...options,
      keepPreviousData: true,
    }
  );
};

export { useAttributesQuery, fetchAttributes };
