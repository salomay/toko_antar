import { QueryParamsType, QueryOptionsType } from "@ts-types/custom.types";
import { stringifySearchQuery } from "@utils/data-mappers";
import { useQuery } from "react-query";
import Attribute from "@repositories/attribute";
import { API_ENDPOINTS } from "@utils/api/endpoints";

const fetchAttributes =  async (id: string) => {
 

  const url = `${API_ENDPOINTS.ATTRIBUTES}/?id=${id}`;
  
  const { data } = await Attribute.all(url);
    
  return { attributes: data };
  
};

const useAttributesQuery = (id: string) => {
  return useQuery<any, Error>([API_ENDPOINTS.ATTRIBUTES, id], () =>
    fetchAttributes(id)
  );
};

export { useAttributesQuery, fetchAttributes };
