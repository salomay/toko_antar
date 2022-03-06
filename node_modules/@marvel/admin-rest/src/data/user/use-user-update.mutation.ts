import { UpdateUser } from "@ts-types/generated";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import User from "@repositories/user";
import { useRouter } from "next/router";
import { ROUTES } from "@utils/routes";
import { API_ENDPOINTS } from "@utils/api/endpoints";
import { useTranslation } from "next-i18next";

export interface IUserUpdateVariables {
  variables:  UpdateUser ;
}

export const useUpdateUserMutation = () => {

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    ({ variables }: IUserUpdateVariables) =>
      User.update(API_ENDPOINTS.USERS, variables),
    {
      onSuccess: () => {
        toast.success(t("common:successfully-updated"));
        router.push(ROUTES.USERS);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.ME);
      },
    }
  );
};
