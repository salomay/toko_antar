import { fetchSettings } from '@framework/app/settings.query';
import { fetchCategories } from '@framework/categories/categories.query';
import { fetchGroups, fetchGroup } from '@framework/groups/groups.query';
import { fetchProducts } from '@framework/products/products.query';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { GetStaticPathsContext, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
// This function gets called at build time
export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const { types } = await fetchGroups();

  const paths = types?.flatMap((type: any) =>
    locales?.map((locale) => ({ params: { pages: [type.slug] }, locale }))
  );
  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return {
    paths: paths.concat(
      locales?.map((locale) => ({ params: { pages: [] }, locale }))
    ),
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(API_ENDPOINTS.SETTINGS, fetchSettings);
  const { types } = await fetchGroups();
  const homePage =
    types?.find((type: any) => type?.settings?.isHome)?.slug ??
    types?.[0]?.slug;
  const pageType = params?.pages?.[0] ?? homePage;
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.PRODUCTS, { type: pageType }],
    fetchProducts,
    {
      staleTime: 60 * 1000,
    }
  );
  await queryClient.prefetchQuery(
    [
      API_ENDPOINTS.CATEGORIES,
      {
        type: pageType,
        limit: 1000,
        parent:
          types?.find((t) => t?.slug === pageType)?.settings?.layoutType ===
          'minimal'
            ? 'all'
            : 'null',
      },
    ],
    fetchCategories,
    {
      staleTime: 60 * 1000,
    }
  );
  await queryClient.prefetchQuery(API_ENDPOINTS.TYPE, fetchGroups, {
    staleTime: 60 * 1000,
  });

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.TYPE, pageType],
    () => fetchGroup(pageType),
    {
      staleTime: 10 * 1000,
    }
  );

  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'banner'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
    revalidate: 120,
  };
};
