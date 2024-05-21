import { useState } from 'react';
import Toast, { ToastData } from '@/app/_components/Toast';

const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState<ToastData>({
    message: '',
    title: '',
    type: 'success',
  });

  const showErrorToast = (title?: string, message?: string) => {
    setToastData({
      title: title || '',
      message: message || '',
      type: 'error',
    });
    setShowToast(true);
  };

  const showSuccessToast = (title?: string, message?: string) => {
    setToastData({
      title: title || '',
      message: message || '',
      type: 'success',
    });
    setShowToast(true);
  };

  const hideToast = async (delay?: number) => {
    if (delay) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    setShowToast(false);
  };

  const renderToastContents = () => {
    return (
      <Toast
        show={showToast}
        setShow={setShowToast}
        message={toastData.message}
        title={toastData.title}
        type={toastData.type}
      />
    );
  };

  return {
    showToast,
    toastData,
    showErrorToast,
    showSuccessToast,
    hideToast,
    renderToastContents,
  };
};

export default useToast;
