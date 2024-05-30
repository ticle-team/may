import { Stack } from '@/models/stack';
import Badge from '@/app/_components/Badge';

type Props = {
  stack: Stack;
  handleStackClick: (id: number) => void;
};

const StackItem = ({ stack, handleStackClick }: Props) => {
  return (
    <div
      className="relative flex justify-between gap-x-6 px-4 py-5 ml-20 border-t border-gray-100 hover:bg-gray-50 sm:px-6 lg:px-8  hover:cursor-pointer"
      onClick={() => {
        handleStackClick(stack.id);
      }}
    >
      <div className="flex gap-x-5">
        <div>{stack.name}</div>
        <div>{stack.description}</div>
      </div>
      <Badge color="blue">Blue</Badge>
    </div>
  );
};

export default StackItem;
