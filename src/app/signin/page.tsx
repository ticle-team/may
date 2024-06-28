'use client';

import Link from 'next/link';
import { LogoIcon } from '@/app/_components/Icons';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import { shapleClient } from '@/app/_services/shapleClient';
import useToast from '@/app/_hooks/useToast';
import SignUpModal from '@/app/signin/SignUpModal';

// TODO : will be replaced with the actual redirect URL
const DISABLED_CALLBACK_URLS = ['/resetpassword'];
// TODO : will be replaced with the actual redirect URL
const DEFAULT_REDIRECT_URL = '/projects';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { renderToastContents, showErrorToast, showSuccessToast } = useToast();
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

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
    if (loading) return;
    setLoading(true);
    try {
      const res = await shapleClient.auth.signInWithPassword({
        email,
        password,
      });
      if (res.error) {
        showErrorToast('Failed to login', 'Invalid email or password');
      } else if (typeof location !== 'undefined') location.replace(callbackUrl);
    } catch (e) {
      showErrorToast('Failed to login', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {renderToastContents()}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex shrink-0 justify-center">
            <LogoIcon />
          </div>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.stopPropagation();
              e.preventDefault();
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  <Link
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <Suspense>
              <button
                className="h-11 flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                disabled={loading || email === '' || password === ''}
                type="submit"
              >
                {loading ? <LoadingSpinner /> : 'Sign in'}
              </button>
            </Suspense>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <button
              onClick={() => setOpenSignUpModal(true)}
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
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
