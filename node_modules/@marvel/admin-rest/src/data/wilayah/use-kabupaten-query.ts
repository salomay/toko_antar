import {
    QueryParamsType,
    TypesQueryOptionsType,
  } from "@ts-types/custom.types";
  import { mapPaginatorData, stringifySearchQuery } from "@utils/data-mappers";
  import { useQuery } from "react-query";
  import Kabupaten from "@repositories/kabupaten";
  import { API_ENDPOINTS } from "@utils/api/endpoints";
  import { typeKabupaten as TKabupaten } from "@ts-types/generated";


  
  const fetchKabupaten = async ({ queryKey }: QueryParamsType) => {
    const [_key, params] = queryKey;
    
    
    const url = `${API_ENDPOINTS.KABUPATEN}?id_prov=${params?.text}`;


    const { data } = await Kabupaten.all(url);
    return { data_kabupaten: data as TKabupaten[] };
  };
  
  type TypeResponse = {
    data_kabupaten: TKabupaten[];
  };

  
  const useKabupatenQuery = (options: TypesQueryOptionsType = {}) => {
    return useQuery<TypeResponse, Error>(
      [API_ENDPOINTS.KABUPATEN, options],
      fetchKabupaten,
      {
        keepPreviousData: true,
      }
    );
  };
  
  export { useKabupatenQuery, fetchKabupaten };
  