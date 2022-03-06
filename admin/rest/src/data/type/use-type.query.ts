import Type from "@repositories/type";
import { useQuery } from "react-query";
import { Type as TType } from "@ts-types/generated";
import { API_ENDPOINTS } from "@utils/api/endpoints";

export const fetchType = async (id: string) => {
  const { data } = await Type.find(`${API_ENDPOINTS.TYPES}/?id=${id}`);
  return data;
};

export const useTypeQuery = (id: string) => {
  return useQuery<TType, Error>([API_ENDPOINTS.TYPES, id], () =>
    fetchType(id)
  );
};
