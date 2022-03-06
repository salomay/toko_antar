import Product from "@repositories/product";
import { useQuery } from "react-query";
import { Product as TProduct } from "@ts-types/generated";
import { API_ENDPOINTS } from "@utils/api/endpoints";

export const fetchProduct = async (id: string) => {
  const { data } = await Product.find(`${API_ENDPOINTS.PRODUCTS}?id=${id}`);
  return data;
};

export const useProductQuery = (id: string) => {
  return useQuery<TProduct, Error>([API_ENDPOINTS.PRODUCTS, id], () =>
    fetchProduct(id)
  );
};
