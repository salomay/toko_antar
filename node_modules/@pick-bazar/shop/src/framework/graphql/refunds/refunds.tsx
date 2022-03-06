import ErrorMessage from '@components/ui/error-message';
import { useRefundsQuery } from '@framework/refunds/refunds.graphql';
import { NetworkStatus } from '@apollo/client';
import { RefundView } from '@components/refunds/refund-view';

const Refunds = () => {
  const { data, loading, error, fetchMore, networkStatus } = useRefundsQuery({
    variables: {
      orderBy: 'created_at',
      sortedBy: 'desc',
    },
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message={error.message} />;
  const loadingMore = networkStatus === NetworkStatus.fetchMore;
  function handleLoadMore() {
    if (data?.products?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.products?.paginatorInfo?.currentPage + 1,
          first: 30,
        },
      });
    }
  }
  // return <div>{JSON.stringify(data, null, 2)}</div>;
  return <RefundView refund={data?.refunds?.data} />;
};

export default Refunds;
