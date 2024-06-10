import { useState } from 'react';
import Button from '@/app/_components/Button';

type Props = {
  organizationId: number;
  onCreate: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
};

const CreateProjectModal = ({ onCreate, onCancel }: Props) => {
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await onCreate(projectName, projectDescription);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <span className="font-semibold text-xl">Create Project</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="w-full">
          <input
            type="text"
            placeholder="name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="w-full">
          <textarea
            rows={5}
            placeholder="Description (optional)"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end items-center gap-x-6">
        <Button color="secondary" onClick={onCancel}>
          cancel
        </Button>
        <Button
          color="primary"
          disabled={loading || projectName === ''}
          onClick={handleCreateProject}
        >
          Create
        </Button>
      </div>
    </div>
  );
};

export default CreateProjectModal;
