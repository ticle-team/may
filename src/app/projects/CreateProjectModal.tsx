import { useState } from 'react';
import Button from '@/app/_components/Button';
import useToast from '@/app/_hooks/useToast';
import { trpc } from '@/app/_trpc/client';
import { Project } from '@/models/project';
import { TRPCClientErrorLike } from '@trpc/client';

type Props = {
  organizationId: number;
  onCreated: (project: Project) => void;
  onCancel: () => void;
  handleProjectCreateError: (error: TRPCClientErrorLike<any>) => void;
};

const CreateProjectModal = ({
  organizationId,
  onCreated,
  onCancel,
  handleProjectCreateError,
}: Props) => {
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');

  const createProjectMutation = trpc.project.create.useMutation({
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      console.error(error);
      handleProjectCreateError(error);
    },
  });

  const handleCreateProject = async () => {
    // TODO: Implement create project feature
    const createResult = await createProjectMutation.mutateAsync({
      orgId: organizationId,
      name: projectName,
      description: projectDescription,
    });
    if (!createResult) return;

    onCreated(createResult);
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
    </div>
  );
};

export default CreateProjectModal;
