import { useCallback, useState } from 'react';
import Button from '@/app/_components/Button';
import Dropdown from '@/app/_components/Dropdown';
import RingSpinner from '@/app/_components/RingSpinner';

// TODO: Change the instance zone items
const INSTANCE_ZONE_ITEMS = [{ label: 'default', value: 'default' }];

type Props = {
  onAdd: (zone: string | null, name: string | null) => Promise<void>;
  onCancel: () => void;
};

const AddInstanceModal = ({ onAdd, onCancel }: Props) => {
  const [instanceZone, setInstanceZone] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddInstance = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      await onAdd(instanceZone, instanceName);
    } finally {
      setLoading(false);
    }
  }, [loading, onAdd, instanceZone, instanceName]);

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <span className="font-semibold text-xl">Create Instance</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="flex w-full items-center">
          <span className="font-bold text-sm text-gray-900 min-w-16">
            Region
          </span>
          <Dropdown
            className="w-3/12"
            placeholder="Zone"
            items={INSTANCE_ZONE_ITEMS}
            selectedValue={instanceZone}
            onSelected={(item) => setInstanceZone(item.value)}
          />
        </div>
        <div className="flex w-full items-center">
          <span className="font-bold text-sm text-gray-900 min-w-16">Name</span>
          <input
            type="text"
            placeholder="Stack-Instance-SK"
            value={instanceName ?? ''}
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
          className="flex justify-center items-center"
          color="primary"
          disabled={loading}
          onClick={handleAddInstance}
        >
          Add
          {loading && (
            <RingSpinner shape="with-bg" className="flex w-6 h-6 ml-1.5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddInstanceModal;
