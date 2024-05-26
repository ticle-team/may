import classnames from 'classnames';

export const Button = ({
  children,
  onClick,
  color = 'primary',
}: React.PropsWithChildren<{
  color: string;
  onClick?: () => void | Promise<void>;
}>) => (
  <button
    onClick={onClick}
    className={classnames(
      'flex font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50',
      {
        'text-white bg-primary-700 hover:bg-primary-600 focus:ring-primary-500':
          color === 'primary',
      },
    )}
  >
    {children}
  </button>
);
