import { UpdateCategory } from "@ts-types/generated";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import Category from "@repositories/category";
import { useRouter } from "next/router";
import { ROUTES } from "@utils/routes";
import { API_ENDPOINTS } from "@utils/api/endpoints";
import { useTranslation } from "next-i18next";

export interface ICategoryUpdateVariables {
  variables: {
    id: string;
    input: UpdateCategory;
  };
}

export const useUpdateCategoryMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    ({ variables: { id, input } }: ICategoryUpdateVariables) =>
      Category.update(`${API_ENDPOINTS.CATEGORIES}/${id}`, input),
    {
      onSuccess: () => {
        toast.success(t("common:successfully-updated"));
        router.push(ROUTES.CATEGORIES);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
      },
    }
  );
};