import { useState } from 'react';
import Button from '@/app/_components/Button';
import DialogModal from '@/app/_components/Dialog';

type Props = {
  onCreated: () => void;
  onCancel: () => void;
};

const CreateProjectModal = ({ onCreated, onCancel }: Props) => {
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCreateProject = async () => {
    // TODO: Implement create project feature
    // TODO: Implement the create thread feature after the project is created
    // const { id: threadId } = await createThread.mutateAsync({
    //   projectId: BigInt(1),
    // });
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <span className="font-semibold text-xl">프로젝트 생성하기</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="w-full">
          <input
            type="text"
            placeholder="프로젝트 명"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="w-full">
          <textarea
            rows={5}
            placeholder="설명"
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
        <Button color="primary" onClick={handleCreateProject}>
          Create
        </Button>
      </div>
      <DialogModal
        open={showError}
        setOpen={setShowError}
        description={errorMessage}
        type={'alert'}
      />
    </div>
  );
};

export default CreateProjectModal;
