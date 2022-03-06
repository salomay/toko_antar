import Layout from "@components/layouts/admin";
import UpdateUserForm from "@components/user/user-form-edit";
import ErrorMessage from "@components/ui/error-message";
import Loader from "@components/ui/loader/loader";
import { getUsersQuery } from "@data/user/use-edit-user";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function UpdateUserPage() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const {
    data,
    isLoading: loading,
    error,
  } = getUsersQuery(query.userId as string);

  if (loading) return <Loader text={t("common:text-loading")} />;
  if (error) return <ErrorMessage message={error?.message as string} />;
  return (
    <>
      <div className="py-5 sm:py-8 flex border-b border-dashed border-border-base">
        <h1 className="text-lg font-semibold text-heading">Edit User</h1>
      </div>
      

      <UpdateUserForm initialValues={data} />
    </>
  );
}
UpdateUserPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "form"])),
  },
});
