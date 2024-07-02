import { CheckCircleIcon, StopIcon } from '@heroicons/react/24/solid';
import _ from 'lodash';
import { useMemo } from 'react';
import classNames from 'classnames';
import { trpc } from '@/app/_trpc/client';
import Badge from '@/app/_components/Badge';

export default function StackContainer({
  showError,
  name,
  description,
  baseApis,
  vapis,
}: {
  showError: (message: string) => void;
  name: string;
  description: string;
  baseApis: {
    id: number;
    name: string;
  }[];
  vapis: {
    id: number;
    name: string;
  }[];
}) {
  const { data: vapiReleases, error } =
    trpc.vapi.getLatestReleasesByNames.useQuery({
      names: vapis.map(({ name }) => name),
    });
  if (error) {
    showError(error.message);
  }

  return (
    <>
      <div className="flex flex-col w-full h-full p-4 overflow-y-auto">
        <div className="flex justify-end px-2 font-semibold text-xs text-gray-300">
          Dashboard
        </div>
        {name != '' ? (
          <article className="prose px-7 pt-4.5 pb-12">
            <h1>{name}</h1>
            {description != '' && (
              <p className="text-slate-500 -mt-4">{description}</p>
            )}
            {baseApis.length > 0 && (
              <>
                <h2>Base APIs</h2>
                <ul className="-mt-4">
                  {baseApis.map(({ id, name }) => (
                    <li className="text-slate-500" key={`base-api-${id}`}>
                      {name}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {vapiReleases && vapiReleases.length > 0 && (
              <>
                <h2>VAPIs</h2>
                <ul className="-mt-4">
                  {vapiReleases.map((rel) => (
                    <li key={`vapi-${rel.id}`} className="space-x-2">
                      <span className="text-slate-500">
                        {rel.package?.name}
                      </span>
                      {rel.package?.author && (
                        <span className="text-gray-400">
                          @{rel.package?.author?.name}
                        </span>
                      )}
                      <Badge>RANK: {rel.package?.overallRank}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        ) : (
          <p className="flex justify-center items-center w-full h-full text-gray-400 text-2xl font-semibold">
            {'{Stack}'}
          </p>
        )}
      </div>
    </>
  );
}
