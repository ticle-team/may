import { ShapleStack, Stack } from '@/models/stack';
import Badge from '@/app/_components/Badge';
import Link from 'next/link';

type Props = {
  stack: ShapleStack;
  onClick: (id: number) => void;
};

const StackItem = ({ stack, onClick }: Props) => {
  return (
    <Link
      className="relative flex justify-between gap-x-6 px-4 py-5 ml-20 border-t border-gray-100 hover:bg-gray-50 sm:px-6 lg:px-8"
      // onClick={() => {
      //   onClick(stack.id);
      // }}
      href={`/stacks/${stack.id}`}
    >
      <div className="flex gap-x-5">
        <div>{stack.name}</div>
        <div>{stack.description}</div>
      </div>
      <Badge color="blue">Blue</Badge>
    </Link>
  );
};

export default StackItem;
