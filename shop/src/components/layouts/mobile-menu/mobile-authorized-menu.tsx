import { siteSettings } from '@settings/site';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import DrawerWrapper from '@components/ui/drawer/drawer-wrapper';
import { useAtom } from 'jotai';
import { drawerAtom } from '@store/drawer-atom';
import useUser from '@framework/auth/use-user';
import { ROUTES } from '@lib/routes';

export default function MobileAuthorizedMenu() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { me } = useUser();
  const [_, closeSidebar] = useAtom(drawerAtom);
  function handleClick(path: string) {
    router.push(path);
    closeSidebar({ display: false, view: '' });
  }
  return (
    <DrawerWrapper>
      <ul className="flex-grow">
        <li className="flex justify-between items-center w-full pt-3 px-5 md:px-8 text-sm text-start font-semibold capitalize text-body focus:outline-none border-t border-dashed border-border-200 bg-gray-100">
          <span>{t('text-total-points')}</span>
          <span>{me?.wallet?.total_points}</span>
        </li>
        <li className="flex justify-between items-center w-full pt-3 px-5 md:px-8 text-sm text-start font-semibold capitalize text-body focus:outline-none bg-gray-100">
          <span>{t('text-points-used')}</span>
          <span>{me?.wallet?.points_used}</span>
        </li>
        <li className="flex justify-between items-center w-full py-3 px-5 md:px-8 text-sm text-start font-semibold capitalize text-body focus:outline-none border-b border-dashed border-border-200 bg-gray-100">
          <span>{t('text-available-points')}</span>
          <span>{me?.wallet?.available_points}</span>
        </li>

        {siteSettings.authorizedLinksMobile.map(({ href, label }) => (
          <li key={`${href}${label}`}>
            <span
              className="block py-3 px-5 md:px-8 text-sm font-semibold capitalize text-heading transition duration-200 hover:text-accent cursor-pointer"
              onClick={() => handleClick(href)}
            >
              {t(label)}
            </span>
          </li>
        ))}
      </ul>
    </DrawerWrapper>
  );
}
