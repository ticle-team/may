import { ReactNode } from 'react';
import classNames from 'classnames';

type Color =
  | 'gray'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'none';
export type BadgeProps = {
  children: ReactNode;
  color?: Color;
  className?: string;
};

export default function Badge({ children, color, className }: BadgeProps) {
  const colors = [
    'gray',
    'red',
    'yellow',
    'green',
    'blue',
    'indigo',
    'purple',
    'pink',
  ];
  const color1 =
    color ?? (colors[Math.floor(Math.random() * colors.length)] as Color);

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium ring-1 ring-inset',
        className ?? '',
        {
          'text-gray-600 ring-gray-500/10': color1 === 'gray',
          'text-red-600 ring-red-500/10': color1 === 'red',
          'text-yellow-600 ring-yellow-500/10': color1 === 'yellow',
          'text-green-600 ring-green-500/10': color1 === 'green',
          'text-blue-600 ring-blue-500/10': color1 === 'blue',
          'text-indigo-600 ring-indigo-500/10': color1 === 'indigo',
          'text-purple-600 ring-purple-500/10': color1 === 'purple',
          'text-pink-600 ring-pink-500/10': color1 === 'pink',
        },
      )}
    >
      {children}
    </span>
  );
}
