import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ErrorMessage from '@components/ui/error-message';
import { useProductsQuery } from '@framework/products/products.query';
import useHomepage from '@framework/utils/use-homepage';
const AutoSuggestion = dynamic(() => import('@components/ui/auto-suggestion'));

interface AutoSuggestionProps {
  shopId?: string;
  className?: string;
  searchQuery: string;
  visible: boolean;
}
const AutoSuggestionBox: React.FC<AutoSuggestionProps> = ({
  shopId,
  searchQuery,
  className,
  visible,
}) => {
  const { query } = useRouter();
  const { homePage } = useHomepage();

  const group = (query.pages?.[0] as string) ?? (homePage?.slug as string);

  const {
    isFetching: loading,
    isError,
    data,
    error,
  } = useProductsQuery(
    {
      ...(Boolean(shopId) ? { shop_id: Number(shopId) } : { type: group }),
      name: searchQuery,
      categories: query?.category as string,
    },
    {
      enabled: Boolean(group),
    }
  );

  if (isError && error) return <ErrorMessage message={error.message} />;

  return (
    <AutoSuggestion
      suggestions={data?.pages?.[0]?.data}
      notFound={!loading && !data?.pages?.[0]?.data?.length}
      visible={visible}
      className={className}
      showLoaders={loading && !data?.pages?.length}
    />
  );
};

export default AutoSuggestionBox;
