import Scrollbar from '@components/ui/scrollbar';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { Fragment } from 'react';
import { getIcon } from '@lib/get-icon';
import { CaretDown } from '@components/icons/caret-down';
import * as groupIcons from '@components/icons/groups';
import { Type } from '@framework/types';
import { useRouter } from 'next/router';
import Link from '@components/ui/link';
import { ArrowDownIcon } from '@components/icons/arrow-down';

interface GroupsMenuProps {
  className?: string;
  groups?: Type[];
  defaultGroup?: Type;
  variant?: 'colored' | 'minimal';
}

export const GroupsMenu: React.FC<GroupsMenuProps> = ({
  className,
  groups,
  defaultGroup,
  variant = 'colored',
}) => {
  const router = useRouter();
  const selectedMenu =
    groups?.find((type) => router.asPath.includes(type.slug)) ?? defaultGroup;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className={cn(
          'flex items-center flex-shrink-0 text-sm md:text-base font-semibold h-11 focus:outline-none text-heading xl:px-4',
          {
            'bg-gray-50 border border-border-200 rounded-lg px-3':
              variant === 'minimal',
            'bg-light xl:border border-border-200 xl:text-accent xl:min-w-150 rounded':
              variant === 'colored',
          },
          className
        )}
      >
        {({ open }) => (
          <>
            {variant === 'colored' && selectedMenu?.icon && (
              <span className="flex w-5 h-5 me-2 items-center justify-center">
                {getIcon({
                  iconList: groupIcons,
                  iconName: selectedMenu?.icon,
                  className: 'max-h-full max-w-full',
                })}
              </span>
            )}
            <span className="whitespace-nowrap">{selectedMenu?.name}</span>
            <span className="flex ps-2.5 pt-1 ms-auto">
              {variant === 'colored' && (
                <CaretDown
                  className={open ? 'transform rotate-180' : undefined}
                />
              )}

              {variant === 'minimal' && (
                <ArrowDownIcon
                  className={cn('h-3 w-3', {
                    'transform rotate-180': open,
                  })}
                />
              )}
            </span>
          </>
        )}
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
            'absolute  mt-2  py-2 w-48 h-56 lg:h-auto min-h-40 max-h-56 sm:max-h-72 bg-light rounded shadow-700 focus:outline-none',
            {
              'border border-border-200 end-0 origin-top-end':
                variant === 'minimal',
              'end-0 xl:end-auto xl:start-0 origin-top-end xl:origin-top-start':
                variant !== 'minimal',
            }
          )}
        >
          <Scrollbar
            className="w-full h-full"
            options={{
              scrollbars: {
                autoHide: 'never',
              },
            }}
          >
            {groups?.map(({ id, name, slug, icon }) => (
              <Menu.Item key={id}>
                {({ active }) => (
                  <Link
                    href={`/${slug}`}
                    className={cn(
                      'flex space-s-4 items-center w-full px-5 py-2.5 text-sm font-semibold capitalize  transition duration-200 hover:text-accent focus:outline-none',
                      active ? 'text-accent' : 'text-body-dark'
                    )}
                  >
                    {icon && variant === 'colored' && (
                      <span className="flex w-5 h-5 items-center justify-center">
                        {getIcon({
                          iconList: groupIcons,
                          iconName: icon,
                          className: 'max-h-full max-w-full',
                        })}
                      </span>
                    )}
                    <span>{name}</span>
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Scrollbar>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
