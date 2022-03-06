import {
    QueryParamsType,
    TypesQueryOptionsType,
  } from "@ts-types/custom.types";
  import { mapPaginatorData, stringifySearchQuery } from "@utils/data-mappers";
  import { useQuery } from "react-query";
  import Kecamatan from "@repositories/kecamatan";
  import { API_ENDPOINTS } from "@utils/api/endpoints";
  import { typeKecamatan as TKecamatan } from "@ts-types/generated";


  
  const fetchKecamatan = async ({ queryKey }: QueryParamsType) => {
    const [_key, params] = queryKey;

    
    const url = `${API_ENDPOINTS.KECAMATAN}?id_kab=${params?.text}`;

    const { data } = await Kecamatan.all(url);


    return { data_kecamatan: data as TKecamatan[] };
  };
  
  type TypeResponse = {
    data_kecamatan: TKecamatan[];
  };

  
  const useKecamatanQuery = (options: TypesQueryOptionsType = {}) => {
    return useQuery<TypeResponse, Error>(
      [API_ENDPOINTS.KECAMATAN, options],
      fetchKecamatan,
      {
        keepPreviousData: true,
      }
    );
  };
  
  export { useKecamatanQuery, fetchKecamatan };
  