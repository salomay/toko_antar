import { RefundView } from '@components/refunds/refund-view';
import ErrorMessage from '@components/ui/error-message';
import { useRefundsQuery } from './refunds.query';

const Refunds = () => {
  const {
    data,
    isFetching: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: loadingMore,
  } = useRefundsQuery({
    orderBy: 'created_at',
    sortedBy: 'desc',
  });

  if (error) return <ErrorMessage message={error.message} />;
  function handleLoadMore() {
    fetchNextPage();
  }

  console.log(data, 'refund data');

  return (
    // <div />
    <RefundView refund={data?.pages[0]?.data} />
    // <div>
    //   <pre>{JSON.stringify(data, null, 2)}</pre>
    // </div>
  );
};

export default Refunds;
