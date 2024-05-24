import { Dialog } from '@headlessui/react';
import Modal from '@/app/_components/Modal';

export type DialogProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'confirm' | 'alert';
  confirmText?: string;
  cancelText?: string;
  open: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
};

const DialogModal = ({
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
}: DialogProps) => {
  const dialogContents = (
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
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        {type == 'alert' ? (
          <>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              onClick={() => {
                setOpen(false);
                onClose?.();
                onConfirm && onConfirm();
              }}
            >
              {confirmText}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              onClick={() => {
                setOpen(false);
                onClose?.();
                onConfirm && onConfirm();
              }}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={() => {
                setOpen(false);
                onClose?.();
                onCancel && onCancel();
              }}
            >
              {cancelText}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      contents={dialogContents}
      open={open}
      setOpen={setOpen}
      onClose={onClose}
      {...props}
    ></Modal>
  );
};

export default DialogModal;
