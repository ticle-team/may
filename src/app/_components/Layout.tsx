'use client'

import SideMenu from "@/app/_components/SideMenu";
import Header from "@/app/_components/Header";
import ChatBar from '@/app/_components/ChatBar';
import { usePathname } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pages = [
    { href: '/organization', hideSideMenu: false, hideHeader: false, hideChatBar: true },
    { href: '/stage', hideSideMenu: false, hideHeader: false, hideChatBar: false },
    { href: '/project', hideSideMenu: false, hideHeader: false, hideChatBar: false },
    { href: '/planet', hideSideMenu: false, hideHeader: false, hideChatBar: false },
    { href: '/guide', hideSideMenu: false, hideHeader: false, hideChatBar: false },
    { href: '/signin', hideSideMenu: true, hideHeader: true, hideChatBar: true },
  ];

  const currnetPath = usePathname().split('/')[1];
  const currentPage = pages.find((item) => item.href.split('/')[1] === currnetPath);

  return (
    <div className='flex w-full h-full flex-1'>
      <SideMenu currentMenu={currentPage?.href ?? ""} hidden={currentPage?.hideSideMenu} />
      <div className={`grow ${(currentPage?.hideSideMenu ?? true) ? "" : "pl-72"}`}>
        <Header hidden={currentPage?.hideHeader} />
        <div className="flex flex-col items-center h-[calc(100%-64px)]">
          {children}
          <ChatBar hidden={currentPage?.hideChatBar} hideSideMenu={currentPage?.hideSideMenu} />
        </div>
      </div>
    </div>
  )
}
