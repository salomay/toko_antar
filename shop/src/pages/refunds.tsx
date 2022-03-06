import DashboardSidebar from '@components/dashboard/sidebar';
import { getLayout as getSiteLayout } from '@components/layouts/layout';
import Refunds from '@framework/refunds/refunds';
export { getStaticProps } from '@framework/ssr/common';

export default function RefundsPage() {
  return <Refunds />;
}

const getLayout = (page: React.ReactElement) =>
  getSiteLayout(
    <div className="bg-gray-100 flex flex-col lg:flex-row items-start max-w-1920 w-full mx-auto md:py-10 md:px-5 xl:py-14 xl:px-8 2xl:px-14 min-h-screen lg:min-h-0">
      <DashboardSidebar className="flex-shrink-0 hidden lg:block lg:w-80 me-8" />
      {page}
    </div>
  );
RefundsPage.authenticate = true;

RefundsPage.getLayout = getLayout;
