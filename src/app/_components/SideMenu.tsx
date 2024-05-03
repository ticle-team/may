import classNames from 'classnames';
import Link from "next/link";
import { LogoIcon } from '@/app/_components/Icons';
import {
  BookOpenIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

type Props = {
  currentMenu?: string,
  hidden?: boolean,
}

export default function SideMenu({ currentMenu, hidden = true }: Props) {
  const sideBarClass = classNames({
    'flex w-72 flex-col': true,
    'fixed inset-y-0 z-50': true,
    'hidden': hidden,
  });

  const navigations = [
    { name: 'Organization', href: '/organization', icon: UserGroupIcon },
    { name: 'Stage', href: '/stage', icon: FolderIcon },
    { name: 'Project', href: '/project', icon: ServerIcon },
    { name: 'Planet', href: '/planet', icon: GlobeAltIcon },
    { name: 'Guide', href: '/guide', icon: BookOpenIcon },
  ];

  return (
    <div className={sideBarClass}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <div className="flex h-16 shrink-0 items-center">
          <LogoIcon />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigations.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold text-gray-700 ${currentMenu == item.href ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                    >
                      {item.icon && <item.icon className="h-6 w-6 shrink-0 text-gray-400" aria-hidden="true" />}
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
