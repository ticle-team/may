import React, { useEffect } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { shapleClient } from '@/app/_services/shapleClient';
import { useRouter } from 'next/navigation';

type Props = {
  hidden?: boolean;
};

export default function Header({ hidden = true }: Props) {
  const [user, setUser] = React.useState(null);
  const headerClass = classNames({
    'flex h-16 shrink-0 justify-end items-center gap-x-6 bg-white border-b border-gray-900/10 px-4 shadow-sm sm:px-6 lg:px-8':
      true,
    'sticky top-0 z-40': true,
    hidden: hidden,
  });
  const router = useRouter();
  const handleSignOut = async () => {
    await shapleClient.auth.signOut();
    setUser(null);
    router.replace('/');
  };

  useEffect(() => {
    shapleClient.auth.getUser().then(() => {
      setUser(user);
    });
  }, []);

  return (
    <div className={headerClass}>
      {user ? (
        <Link
          href="/signin"
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Login
        </Link>
      ) : (
        <button
          onClick={handleSignOut}
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
