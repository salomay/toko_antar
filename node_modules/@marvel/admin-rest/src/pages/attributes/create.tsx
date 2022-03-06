import Layout from "@components/layouts/admin";
import CreateAttributeForm from "@components/attribute/attribute-form";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";


export default function UpdateUserPage() {
 
  
  return (
    <>
      <div className="py-5 sm:py-8 flex border-b border-dashed border-border-base">
        <h1 className="text-lg font-semibold text-heading">Add Attribute</h1>
      </div>
      

      <CreateAttributeForm />
    </>
  );
}
UpdateUserPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "form"])),
  },
});
