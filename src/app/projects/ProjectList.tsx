import { Project } from '@/models/project';
import {
  ClipboardDocumentIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';
import StackList from '@/app/projects/StackList';
import { TRPCClientErrorLike } from '@trpc/client';

type Props = {
  rows: Project[];
  handleThreadCreateError: (error: TRPCClientErrorLike<any>) => void;
};

const ProjectList = ({ rows, handleThreadCreateError }: Props) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const handleClickProject = (projectId: number) => {
    if (selectedProjectId === projectId) {
      return setSelectedProjectId(null);
    }
    setSelectedProjectId(projectId);
  };

  return (
    <div role="list">
      {rows.map((project) => (
        <div key={`project-${project.id}`}>
          <div
            className="relative flex justify-between gap-x-6 px-4 py-5 border-y border-gray-100 hover:bg-gray-50 sm:px-6 lg:px-8"
            onClick={() => {
              handleClickProject(project.id);
            }}
          >
            <div className="flex min-w-0 items-center">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {project.name}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-x-4">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <StarIcon className="h-5 w-5 text-primary-500" />
              <ClipboardDocumentIcon className="h-5 w-5 text-primary-500" />
            </div>
          </div>
          {project.id === selectedProjectId && (
            <StackList
              projectId={project.id}
              rows={project.stacks}
              handleThreadCreateError={handleThreadCreateError}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
