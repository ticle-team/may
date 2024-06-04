import Button from '@/app/_components/Button';
import { Stack } from '@/models/stack';
import { useState } from 'react';

type Props = {
  stack: Stack;
  setStackDescription: (description: string) => void;
  onClickEditDescBtn: () => void;
};

const StackDescription = ({
  stack,
  setStackDescription,
  onClickEditDescBtn,
}: Props) => {
  return (
    <div>
      <div className="flex items-center gap-x-4">
        <label className="block text-base font-semibold leading-6 text-gray-900">
          Description
        </label>
        <Button onClick={() => onClickEditDescBtn()}>Edit</Button>
      </div>
      <div className="mt-4">
        <textarea
          rows={5}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          defaultValue={stack.description}
          onChange={(e) => setStackDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StackDescription;
