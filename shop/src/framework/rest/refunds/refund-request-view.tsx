import {
  useModalAction,
  useModalState,
} from '@components/ui/modal/modal.context';
import { useCreateRefundMutation } from './refunds.query';
import { useTranslation } from 'next-i18next';
import RefundForm from '@components/refunds/refund-form';
import { toast } from 'react-toastify';

const RefundRequestView = () => {
  const { t } = useTranslation('common');
  const { mutate: refundRequest, isLoading: loading } =
    useCreateRefundMutation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  function handleRefundRequest({ title, description, images }: any) {
    refundRequest({
      order_id: data,
      title,
      description,
      images,
    });
    toast.success(t('text-refund-request-submitted'));
    closeModal();
  }
  // need to handle server error
  return <RefundForm onSubmit={handleRefundRequest} loading={loading} />;
};

export default RefundRequestView;
