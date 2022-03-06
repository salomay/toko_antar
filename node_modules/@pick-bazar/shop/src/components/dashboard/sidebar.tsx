import Link from '@components/ui/link';
import { siteSettings } from '@settings/site';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import useUser from '@framework/auth/use-user';

type DashboardSidebarProps = {
  className?: string;
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className }) => {
  const { me } = useUser();

  const { t } = useTranslation();
  const { pathname } = useRouter();
  return (
    <aside className={className}>
      <div className="bg-light rounded border border-border-200 overflow-hidden py-8 px-10 mb-5">
        <h3 className="text-heading font-semibold text-base pb-4 mb-4 border-b border-dashed border-border-200">
          {t('text-wallet')}
        </h3>

        <div className="flex items-center justify-between text-sm text-heading font-semibold mb-2 capitalize">
          <span>{t('text-total-points')}</span>
          <span>{me?.wallet?.total_points ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-heading font-semibold mb-2 capitalize">
          <span>{t('text-points-used')}</span>
          <span>{me?.wallet?.points_used ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-heading font-semibold capitalize">
          <span>{t('text-available-points')}</span>
          <span>{me?.wallet?.available_points ?? 0}</span>
        </div>
      </div>

      <div className="bg-light rounded border border-border-200 overflow-hidden">
        <ul className="py-8">
          {siteSettings.dashboardSidebarMenu
            ?.slice(0, -1)
            .map((item: any, idx) => (
              <li className="py-2" key={idx}>
                <Link
                  href={item.href}
                  className={classNames(
                    'block py-2 px-10 font-semibold text-heading transition-colors border-l-4 border-transparent hover:text-accent focus:text-accent',
                    {
                      'border-accent text-accent': pathname === item.href,
                    }
                  )}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
        </ul>
        {/* End of top part menu */}

        <ul className="bg-light border-t border-border-200 py-4">
          {siteSettings.dashboardSidebarMenu
            ?.slice(-1)
            .map((item: any, idx) => (
              <li className="py-2" key={idx}>
                <Link
                  href={item.href}
                  className={classNames(
                    'block py-2 px-10 font-semibold text-heading transition-colors hover:text-accent focus:text-accent',
                    {
                      'border-l-4 border-accent text-accent':
                        pathname === item.href,
                    }
                  )}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
        </ul>
        {/* End of bottom part menu */}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
