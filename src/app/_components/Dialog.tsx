import { Dialog } from '@headlessui/react';
import Modal from '@/app/_components/Modal';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import RingSpinner from '@/app/_components/RingSpinner';

export type DialogProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'confirm' | 'alert';
  confirmText?: string;
  cancelText?: string;
  open: boolean;
  onConfirm?: () => PromiseLike<void>;
  onCancel?: () => PromiseLike<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => PromiseLike<void>;
};

export default function DialogModal({
  title,
  description,
  type,
  confirmText,
  cancelText,
  open,
  onClose,
  onConfirm,
  onCancel,
  setOpen,
  ...props
}: DialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(false);
    }
  }, [open]);

  const enabled = useMemo(() => {
    return !loading && open;
  }, [open, loading]);

  return (
    <Modal open={open} setOpen={setOpen} onClose={onClose} {...props}>
      <div className="flex flex-col w-full">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-base font-semibold leading-6 text-gray-900"
            >
              {title}
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-900">{description}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          {type == 'alert' ? (
            <>
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:ml-3 sm:w-auto"
                onClick={
                  enabled
                    ? () => {
                        setLoading(true);
                        (async () => {
                          await onConfirm?.();
                          await onClose?.();
                          setOpen(false);
                        })();
                      }
                    : undefined
                }
                disabled={!enabled || !onConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:ml-3 sm:w-auto disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                onClick={
                  enabled
                    ? () => {
                        setLoading(true);
                        (async () => {
                          await onConfirm?.();
                          await onClose?.();
                          setOpen(false);
                        })();
                      }
                    : undefined
                }
                disabled={!enabled || !onConfirm}
              >
                {enabled ? (
                  confirmText
                ) : (
                  <RingSpinner
                    shape={'resize'}
                    className="w-5 h-5 stroke-gray-500"
                  />
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                onClick={
                  enabled
                    ? async () => {
                        setLoading(true);
                        await onClose?.();
                        await onCancel?.();
                        setOpen(false);
                      }
                    : undefined
                }
                disabled={!enabled}
              >
                {cancelText}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
