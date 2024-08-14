'use client';

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { shapleClient } from '@/app/_services/shapleClient';
import { useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';

type Props = {
  hidden?: boolean;
};

export default function Header({ hidden = true }: Props) {
  const utils = trpc.useUtils();
  const user = trpc.user.me.useQuery();
  const headerClass = classNames({
    'flex h-16 shrink-0 justify-end items-center gap-x-6 bg-white border-b border-gray-900/10 px-4 shadow-sm sm:px-6 lg:px-8':
      true,
    'sticky top-0 z-40': true,
    hidden: hidden,
  });
  const router = useRouter();
  const handleSignOut = async () => {
    await shapleClient.auth.signOut();
    await utils.user.me.invalidate();
    router.replace('/signin');
  };

  useEffect(() => {
    shapleClient.auth.onAuthStateChange(async (event) => {
      await utils.user.me.invalidate();
    });
  }, []);

  return (
    <div className={headerClass}>
      {!user.data ? (
        <Link
          href="/signin"
          className="rounded-md bg-primary-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Login
        </Link>
      ) : (
        <button
          onClick={handleSignOut}
          className="rounded-md bg-primary-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Logout
        </button>
      )}

      <button
        type="button"
        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        About
      </button>
    </div>
  );
}
