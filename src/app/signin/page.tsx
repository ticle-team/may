'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { shapleClient } from '@/app/_services/shapleClient';
import useToast from '@/app/_hooks/useToast';
import SignUpModal from '@/app/signin/SignUpModal';
import { TicleLogo } from '@/app/_components/TicleLogo';
import RingSpinner from '@/app/_components/RingSpinner';

// TODO : will be replaced with the actual redirect URL
const DISABLED_CALLBACK_URLS = ['/resetpassword'];
// TODO : will be replaced with the actual redirect URL
const DEFAULT_REDIRECT_URL = '/projects';

function SignInForm({
  showErrorToast,
}: {
  showErrorToast: (title: string, message: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = useMemo(() => {
    const callbackUrl =
      searchParams?.get('callbackUrl') || DEFAULT_REDIRECT_URL;
    if (typeof location !== 'undefined') {
      const pathname = new URL(callbackUrl, location.origin).pathname;
      if (DISABLED_CALLBACK_URLS.includes(pathname)) {
        return DEFAULT_REDIRECT_URL;
      }
    }

    return callbackUrl;
  }, [searchParams]);
  const handleLogin = async () => {
    try {
      const res = await shapleClient.auth.signInWithPassword({
        email,
        password,
      });
      if (res.error) {
        showErrorToast('Failed to login', 'Invalid email or password');
        return;
      }

      router.replace(callbackUrl);
    } catch (e) {
      showErrorToast('Failed to login', String(e));
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (loading) return;
        setLoading(true);

        handleLogin();
      }}
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Password
          </label>
          <div className="text-sm">
            {/*<Link*/}
            {/*  href="#"*/}
            {/*  className="font-semibold text-primary-600 hover:text-primary-500"*/}
            {/*>*/}
            {/*  Forgot password?*/}
            {/*</Link>*/}
          </div>
        </div>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            placeholder={'Password'}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            disabled={loading}
          />
        </div>
      </div>

      <button
        className="h-11 flex w-full justify-center items-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400 disabled:bg-primary-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        disabled={loading || email === '' || password === ''}
        type="submit"
      >
        Sign in
        {loading && (
          <RingSpinner shape="with-bg" className="flex w-6 h-6 ml-1.5" />
        )}
      </button>
    </form>
  );
}

export default function Page() {
  const { renderToastContents, showErrorToast, showSuccessToast } = useToast();
  const [openSignUpModal, setOpenSignUpModal] = useState(false);

  return (
    <>
      {renderToastContents()}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex shrink-0 justify-center">
            <TicleLogo color="black" text="none" className="flex size-2/12" />
          </div>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Suspense>
            <SignInForm showErrorToast={showErrorToast} />
          </Suspense>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <button
              onClick={() => setOpenSignUpModal(true)}
              className="font-semibold leading-6 text-primary-600 hover:text-primary-500"
            >
              Sign up now!
            </button>
          </p>
        </div>
      </div>
      <SignUpModal
        open={openSignUpModal}
        setOpen={setOpenSignUpModal}
        showErrorToast={showErrorToast}
        showSuccessToast={showSuccessToast}
      />
    </>
  );
}
