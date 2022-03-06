import { QueryParamsType, TypesQueryOptionsType } from "@ts-types/custom.types";
import { stringifySearchQuery } from "@utils/data-mappers";
import { useQuery } from "react-query";
import kelurahan from "@repositories/kelurahan";
import { API_ENDPOINTS } from "@utils/api/endpoints";
import { typeKelurahan as TKelurahan } from "@ts-types/generated";

const fetchKelurahan = async ({ queryKey }: QueryParamsType) => {
  const [_key, params] = queryKey;
 

  // const url = `${API_ENDPOINTS.KELURAHAN}?id_prov=${params?.text}`;

  const url = `${API_ENDPOINTS.KELURAHAN}?id_kec=${params?.text}`;
  const { data } = await kelurahan.all(url);

  return { data_kelurahan: data as TKelurahan[] };
};

type TypeResponse = {
  data_kelurahan: TKelurahan[];
};

const useKelurahanQuery = (options: TypesQueryOptionsType = {}) => {
  return useQuery<TypeResponse, Error>(
    [API_ENDPOINTS.KELURAHAN, options],
    fetchKelurahan,
    {
      keepPreviousData: true,
    }
  );
};

export { useKelurahanQuery, fetchKelurahan };
