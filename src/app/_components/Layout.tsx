'use client';

import SideMenu from '@/app/_components/SideMenu';
import Header from '@/app/_components/Header';
import ChatBar from '@/app/_components/ChatBar';
import { usePathname } from 'next/navigation';

type PageProps = {
  hideSideMenu: boolean;
  hideHeader: boolean;
  hideChatBar: boolean;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const pages: Map<string, PageProps> = new Map([
    [
      '/organizations',
      { hideSideMenu: false, hideHeader: false, hideChatBar: true },
    ],
    ['/stage', { hideSideMenu: false, hideHeader: false, hideChatBar: false }],
    [
      '/projects',
      { hideSideMenu: false, hideHeader: false, hideChatBar: false },
    ],
    ['/planet', { hideSideMenu: false, hideHeader: false, hideChatBar: false }],
    ['/guide', { hideSideMenu: false, hideHeader: false, hideChatBar: false }],
    ['/signin', { hideSideMenu: true, hideHeader: true, hideChatBar: true }],
    ['/chat', { hideSideMenu: false, hideHeader: false, hideChatBar: false }],
  ]);

  const currentPath = `/${usePathname().split('/')[1]}`;
  const currentPage = pages.get(currentPath);

  return (
    <div className="flex w-full h-full flex-1">
      <SideMenu currentMenu={currentPath} hidden={currentPage?.hideSideMenu} />
      <div
        className={`grow ${currentPage?.hideSideMenu ?? true ? '' : 'pl-72'}`}
      >
        <Header hidden={currentPage?.hideHeader} />
        <div className="flex flex-col items-center h-[calc(100%-64px)]">
          {children}
          <ChatBar
            hidden={currentPage?.hideChatBar}
            hideSideMenu={currentPage?.hideSideMenu}
          />
        </div>
      </div>
    </div>
  );
}
