import { useContactMutation } from '@framework/contact/contact.graphql';
import { toast } from 'react-toastify';
import ContactForm from '@components/contact/contact-form';
import { useTranslation } from 'next-i18next';

export const Contact = () => {
  const { t } = useTranslation('common');
  const [mutate, { loading }] = useContactMutation();
  async function onSubmit(values: any) {
    const { data } = await mutate({
      variables: {
        input: values,
      },
    });
    if (data?.contactUs?.success) {
      toast.success(t(data.contactUs.message!));
    } else {
      toast.error(t(data?.contactUs?.message!));
    }
  }
  return <ContactForm onSubmit={onSubmit} loading={loading} />;
};
export default Contact;
