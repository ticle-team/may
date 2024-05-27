import { useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import { Stack } from '@/models/stack';
import Badge from '@/app/_components/Badge';

type Props = {
  rows: Stack[];
};

const StackList = ({ rows }: Props) => {
  const router = useRouter();

  const handleCreateStack = () => {
    // TODO: Implement create stack
  };

  const handleStackClick = (stackId: number) => {
    router.push(`/projects/stack/${stackId}`);
  };

  return (
    <ul role="list" className="">
      <li
        className="relative flex justify-center gap-x-6 px-4 py-2 ml-20 hover:bg-gray-50 sm:px-6 lg:px-8 hover:cursor-pointer"
        onClick={handleCreateStack}
      >
        <div className="font-normal text-sm text-primary-500">Create Stack</div>
      </li>
      {rows.map((stack) => (
        <li
          key={`stack-${stack.id}`}
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
        </li>
      ))}
    </ul>
  );
};

export default StackList;
