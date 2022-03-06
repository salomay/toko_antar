import {
  useModalAction,
  useModalState,
} from '@components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import { useCreateRefundMutation } from '@framework/refunds/refunds.graphql';
import RefundForm from '@components/refunds/refund-form';
import { toast } from 'react-toastify';

const RefundRequestView = () => {
  const { t } = useTranslation('common');
  const [refundRequest, { loading }] = useCreateRefundMutation({
    refetchQueries: ['Orders'],
    onCompleted: () => {
      toast.success(t('text-refund-request-submitted'));
      closeModal();
    },
  });
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleRefundRequest({ title, description, images }: any) {
    refundRequest({
      variables: {
        input: {
          order_id: data,
          title,
          description,
          images,
        },
      },
    });
  }
  // need to handle server error
  return <RefundForm onSubmit={handleRefundRequest} loading={loading} />;
};

export default RefundRequestView;
