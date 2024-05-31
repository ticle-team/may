import { useState } from 'react';
import Button from '@/app/_components/Button';
import Dropdown from '@/app/_components/Dropdown';

// TODO: Change the instance zone items
const INSTANCE_ZONE_ITEMS = [
  { label: 'east-korea', value: 'east-korea' },
  { label: 'east-asia', value: 'east-asia' },
  { label: 'east-japan', value: 'east-japan' },
  { label: 'east-us', value: 'east-us' },
  { label: 'west-us', value: 'west-us' },
];

type Props = {
  onAdd: (zone: string, name: string) => Promise<void>;
  onCancel: () => void;
};

const AddInstanceModal = ({ onAdd, onCancel }: Props) => {
  const [instanceZone, setInstanceZone] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddInstance = async () => {
    if (loading || !instanceZone) return;
    setLoading(true);

    try {
      await onAdd(instanceZone, instanceName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <span className="font-semibold text-xl">인스턴스 추가하기</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="w-full">
          <Dropdown
            className="max-w-40"
            placeholder="Zone"
            items={INSTANCE_ZONE_ITEMS}
            selectedValue={instanceZone}
            onSelected={(item) => setInstanceZone(item.value)}
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Stack-Instance-SK"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
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
          disabled={loading || instanceZone === null || instanceName === ''}
          onClick={handleAddInstance}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default AddInstanceModal;
