'use client';

import SideMenu from '@/app/_components/SideMenu';
import Header from '@/app/_components/Header';
import ChatBar from '@/app/_components/ChatBar';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, Suspense, useEffect, useMemo } from 'react';
import { shapleClient } from '@/app/_services/shapleClient';
import PageLoading from '@/app/_components/PageLoading';
import { Session } from '@shaple/shaple';
import TRPCProvider from '@/app/_trpc/Provider';
import { RouterProvider } from '@/app/_hooks/router';
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';

type PageProps = {
  hideSideMenu: boolean;
  hideHeader: boolean;
  hideChatBar: boolean;
  includeAuth: boolean;
};

function getSession({
  router,
  pathname,
}: {
  router: ReturnType<typeof useRouter>;
  pathname: string;
}) {
  let result: Session;
  const suspender = shapleClient.auth
    .getSession()
    .then(({ data: { session }, error }) => {
      if (error || session === null) {
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      result = session;
    });

  return {
    use() {
      if (result === undefined) throw suspender;
      else return result;
    },
  };
}

function InternalLayout({ children }: { children: React.ReactNode }) {
  const pages: Map<string, PageProps> = new Map([
    [
      '/organizations',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/stage',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/projects',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/planet',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/guide',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/signin',
      {
        hideSideMenu: true,
        hideHeader: true,
        hideChatBar: true,
        includeAuth: false,
      },
    ],
    [
      '/chat',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/stacks',
      {
        hideSideMenu: false,
        hideHeader: false,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
    [
      '/threads',
      {
        hideSideMenu: true,
        hideHeader: true,
        hideChatBar: true,
        includeAuth: true,
      },
    ],
  ]);

  const pathname = usePathname();
  const router = useRouter();
  const [currentPath, currentPage] = useMemo(() => {
    const currentPath = `/${pathname.split('/')[1]}`;
    const currentPage = pages.get(currentPath) ?? pages.get('/projects')!;
    return [currentPath, currentPage];
  }, [pathname]);

  const { data: session } = useSuspenseQuery({
    queryKey: ['shaple.session'],
    queryFn: async () => {
      const { data, error } = await shapleClient.auth.getSession();
      if (error) {
        return null;
      } else {
        return data.session;
      }
    },
  });

  if (currentPage.includeAuth && !session) {
    router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    return null;
  }

  return (
    <div className="flex w-full h-full flex-1">
      <SideMenu currentMenu={currentPath} hidden={currentPage.hideSideMenu} />
      <div
        className={`grow ${currentPage.hideSideMenu ?? true ? '' : 'pl-72'}`}
      >
        {!currentPage.hideHeader && <Header hidden={currentPage.hideHeader} />}
        <div className="flex flex-col items-center h-full">
          {children}
          <ChatBar
            hidden={currentPage.hideChatBar}
            hideSideMenu={currentPage.hideSideMenu}
          />
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <TRPCProvider>
      <RouterProvider>
        <Suspense fallback={<PageLoading />}>
          <InternalLayout>{children}</InternalLayout>
        </Suspense>
      </RouterProvider>
    </TRPCProvider>
  );
}
