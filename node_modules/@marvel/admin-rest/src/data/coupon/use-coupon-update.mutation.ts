import { CouponUpdateInput } from "@ts-types/generated";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import Coupon from "@repositories/coupon";
import { API_ENDPOINTS } from "@utils/api/endpoints";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ROUTES } from "@utils/routes";

export interface ICouponUpdateVariables {
  variables: { id: number | string; input: CouponUpdateInput };
}

export const useUpdateCouponMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(

    ({ variables: { id, input } }: ICouponUpdateVariables) =>
      Coupon.update(`${API_ENDPOINTS.COUPONS}/${id}`, input),
    {
      onSuccess: () => {
        toast.success(t("common:successfully-updated"));
        router.push(ROUTES.COUPONS);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.COUPONS);
      },
    }
  );
};
