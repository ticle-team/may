import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';

type Props = {
  hidden?: boolean;
};

export default function Header({ hidden = true }: Props) {
  const headerClass = classNames({
    'flex h-16 shrink-0 justify-end items-center gap-x-6 bg-white border-b border-gray-900/10 px-4 shadow-sm sm:px-6 lg:px-8':
      true,
    'sticky top-0 z-40': true,
    hidden: hidden,
  });

  return (
    <div className={headerClass}>
      <Link href="/signin">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Login
        </button>
      </Link>
      <button
        type="button"
        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        About
      </button>
    </div>
  );
}
