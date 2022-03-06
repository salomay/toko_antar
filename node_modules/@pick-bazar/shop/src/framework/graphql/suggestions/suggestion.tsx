import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ErrorMessage from '@components/ui/error-message';
import { useProductsQuery } from '@framework/products/products.graphql';
import { getProducts } from '@framework/utils/products';
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
  const { data, loading, error } = useProductsQuery({
    skip: searchQuery.length < 2,
    // @ts-ignore
    variables: getProducts({
      ...(Boolean(shopId) ? { shopId: Number(shopId) } : { type: group }),
      text: searchQuery,
      category: query?.category as string,
      limit: 10,
    }),
  });

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <AutoSuggestion
      suggestions={data?.products?.data}
      notFound={!loading && !data?.products?.data?.length}
      visible={visible}
      className={className}
      showLoaders={loading && !data?.products?.data.length}
    />
  );
};

export default AutoSuggestionBox;
