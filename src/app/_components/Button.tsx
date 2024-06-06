import classNames from 'classnames';

type Props = React.PropsWithChildren<{
  color?: 'primary' | 'secondary' | 'success';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}>;

export default function Button({
  children,
  onClick,
  color = 'primary',
  size = 'base',
  disabled = false,
}: Props) {
  const buttonClass = classNames({
    'flex focus:outline-none focus:ring-0': true,
    'text-white bg-primary-700 hover:bg-primary-600 focus:bg-primary-800 ring-primary-700':
      color === 'primary' && !disabled,
    'text-white bg-secondary-700 hover:bg-secondary-600 focus:bg-secondary-800 ring-secondary-700':
      color === 'secondary' && !disabled,
    'text-white bg-success-700 hover:bg-success-600 focus:bg-success-800 ring-success-700':
      color === 'success' && !disabled,
    'cursor-not-allowed bg-gray-300 text-gray-500': disabled,
    'font-semibold text-xs py-1 px-2 rounded': size === 'xs',
    'font-semibold text-sm py-1 px-2 rounded': size === 'sm',
    'font-semibold text-base py-1.5 px-2.5 rounded-md': size === 'base',
    'font-semibold text-lg py-2 px-3 rounded-lg': size === 'lg',
    'font-semibold text-xl py-2.5 px-3.5 rounded-lg': size === 'xl',
  });

  return (
    <button onClick={onClick} className={buttonClass} disabled={disabled}>
      {children}
    </button>
  );
}
