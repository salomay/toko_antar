import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { siteSettings } from '@settings/site';
import Avatar from '@components/ui/avatar';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { avatarPlaceholder } from '@lib/placeholders';
import useUser from '@framework/auth/use-user';
import { UserOutlinedIcon } from '@components/icons/user-outlined';

const AuthorizedMenu: React.FC<{ minimal?: boolean }> = ({ minimal }) => {
  const { me } = useUser();
  const router = useRouter();
  const { t } = useTranslation('common');

  function handleClick(path: string) {
    router.push(path);
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center focus:outline-none">
        {minimal ? (
          <UserOutlinedIcon className="w-5 h-5" />
        ) : (
          <Avatar
            src={me?.profile?.avatar?.thumbnail ?? avatarPlaceholder}
            title="user name"
            className="w-10 h-10"
          />
        )}
        <span className="sr-only">{t('user-avatar')}</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className={cn(
            'absolute end-0 w-48 pb-4 mt-1 origin-top-end bg-white rounded shadow-700 focus:outline-none',
            {
              '!mt-2': minimal,
            }
          )}
        >
          <Menu.Item>
            <li className="flex justify-between items-center w-full py-4 px-6 text-xs text-start font-semibold capitalize text-light focus:outline-none bg-accent-500">
              <span>{t('text-points')}</span>
              <span>{me?.wallet?.available_points ?? 0}</span>
            </li>
          </Menu.Item>
          {siteSettings.authorizedLinks.map(({ href, label }) => (
            <Menu.Item key={`${href}${label}`}>
              {({ active }) => (
                <li>
                  <button
                    onClick={() => handleClick(href)}
                    className={cn(
                      'block w-full py-2.5 px-6 text-sm text-start font-semibold capitalize text-heading transition duration-200 hover:text-accent focus:outline-none',
                      active ? 'text-accent' : 'text-heading'
                    )}
                  >
                    {t(label)}
                  </button>
                </li>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AuthorizedMenu;
