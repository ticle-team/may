import { useState } from 'react';
import Button from '@/app/_components/Button';

type Props = {
  onAdd: (title: string, url: string) => Promise<void>;
  onCancel: () => void;
};

const AddReferenceModal = ({ onAdd, onCancel }: Props) => {
  const [referenceURL, setReferenceURL] = useState<string>('');
  const [referenceTitle, setReferenceTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddReference = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await onAdd(referenceTitle, referenceURL);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <span className="font-semibold text-xl">Add reference</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col w-full gap-y-2">
          <span className="font-normal text-sm text-gray-900">URL</span>
          <input
            type="text"
            placeholder="URL"
            value={referenceURL}
            onChange={(e) => setReferenceURL(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="flex flex-col w-full gap-y-2">
          <span className="font-normal text-sm text-gray-900">Title</span>
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
        <Button
          color="primary"
          disabled={loading || referenceURL === '' || referenceTitle === ''}
          onClick={handleAddReference}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default AddReferenceModal;
