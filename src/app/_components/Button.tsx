import classNames from 'classnames';

type Props = React.PropsWithChildren<{
  color?: 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}>;

export default function Button({
  children,
  onClick,
  color = 'primary',
  size = 'lg',
  disabled = false,
}: Props) {
  const buttonClass = classNames({
    'flex focus:outline-none focus:ring-2 focus:ring-opacity-50': true,
    'text-white bg-primary-700 hover:bg-primary-600 focus:ring-primary-500':
      color === 'primary' && !disabled,
    'text-gray-900 bg-white hover:bg-gray-50 focus:ring-primary-500 ring-1 ring-inset ring-gray-300':
      color === 'secondary' && !disabled,
    'cursor-not-allowed bg-gray-300 text-gray-500': disabled,
    'font-semibold text-xs py-1 px-2 rounded': size === 'xs',
    'font-semibold text-sm py-1 px-2 rounded': size === 'sm',
    'font-semibold text-sm py-1.5 px-2.5 rounded-md': size === 'base',
    'font-semibold text-sm py-2 px-3 rounded-md': size === 'lg',
    'font-semibold text-sm py-2.5 px-3.5 rounded-md': size === 'xl',
  });

  return (
    <button onClick={onClick} className={buttonClass} disabled={disabled}>
      {children}
    </button>
  );
}
