import { QueryParamsType, TypesQueryOptionsType } from "@ts-types/custom.types";
import { stringifySearchQuery } from "@utils/data-mappers";
import { useQuery } from "react-query";
import provinsi from "@repositories/provinsi";
import { API_ENDPOINTS } from "@utils/api/endpoints";
import { typeProvinsi as TProvinsi } from "@ts-types/generated";

const fetchProvinsi = async ({ queryKey }: QueryParamsType) => {
  const [_key, params] = queryKey;
 

  // const url = `${API_ENDPOINTS.PROVINSI}?id_prov=${params?.text}`;

  const url = `${API_ENDPOINTS.PROVINSI}`;
  const { data } = await provinsi.all(url);

  return { data_provinsi: data as TProvinsi[] };
};

type TypeResponse = {
  data_provinsi: TProvinsi[];
};

const useProvinsiQuery = (options: TypesQueryOptionsType = {}) => {
  return useQuery<TypeResponse, Error>(
    [API_ENDPOINTS.PROVINSI, options],
    fetchProvinsi,
    {
      keepPreviousData: true,
    }
  );
};

export { useProvinsiQuery, fetchProvinsi };
