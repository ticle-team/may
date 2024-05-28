import { useState } from 'react';
import Button from '@/app/_components/Button';
import useToast from '@/app/_hooks/useToast';

type Props = {
  onAdded: () => void;
  onCancel: () => void;
};

const AddReferenceModal = ({ onAdded, onCancel }: Props) => {
  const [referenceURL, setReferenceURL] = useState<string>('');
  const [referenceTitle, setReferenceTitle] = useState<string>('');
  const { renderToastContents, showErrorToast } = useToast();

  const handleAddReference = async () => {
    // TODO: Implement add reference feature
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <span className="font-semibold text-xl">레퍼런스 추가하기</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="w-full">
          <input
            type="text"
            placeholder="URL"
            value={referenceURL}
            onChange={(e) => setReferenceURL(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Title"
            value={referenceTitle}
            onChange={(e) => setReferenceTitle(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="flex justify-end items-center gap-x-6">
        <Button color="secondary" onClick={onCancel}>
          cancel
        </Button>
        <Button color="primary" onClick={handleAddReference}>
          Add
        </Button>
      </div>
      {renderToastContents()}
    </div>
  );
};

export default AddReferenceModal;
