import { CheckCircleIcon, StopIcon } from '@heroicons/react/24/solid';
import _ from 'lodash';
import { useMemo } from 'react';
import classNames from 'classnames';

const STEP_TITLES = [
  'Understanding service planning',
  'Create a statement of service',
  'API Recommendations',
  'Create VAPIs',
  'Configure the Ticle stack',
  'Deploy the stack',
] as const;

function Timeline({ progress }: { progress: number }) {
  const steps = useMemo(() => {
    return _.range(1, 6 + 1).map((i) => {
      return {
        title: STEP_TITLES[i - 1],
        beforeCompleted: i - 1 <= progress,
        completed: i <= progress,
        afterCompleted: i + 1 <= progress,
      };
    });
  }, [progress]);
  const maxSteps = steps.length;

  return (
    <ol className="grid grid-cols-6 gap-0">
      {steps.map(({ beforeCompleted, completed, afterCompleted, title }, i) => (
        <li className="flex flex-col items-center" key={`timeline-step-${i}`}>
          <div className="flex flex-row items-center w-full">
            <hr
              className={classNames('grow', {
                'border-0': i === 0,
                'border-2': i !== 0,
                'border-success-400': beforeCompleted && completed,
                'border-info-100': !beforeCompleted || !completed,
              })}
            />
            <div
              className={classNames(
                'z-10 flex items-center justify-center w-8 h-8 rounded-full ring-white ring-4 shrink-0',
                {
                  'bg-info-100 text-black': !completed,
                  'bg-success-400 text-white': completed,
                },
              )}
            >
              {completed ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <StopIcon className="w-6 h-6" />
              )}
            </div>
            <hr
              className={classNames('grow', {
                'border-0': i === maxSteps - 1,
                'border-2': i !== maxSteps - 1,
                'border-success-400': completed && afterCompleted,
                'border-info-100': !completed || !afterCompleted,
              })}
            />
          </div>
          <div className="flex mt-3 w-full justify-center text-sm font-semibold text-gray-400">
            <span className="text-center">{title}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Stack({
  progress,
  name,
  description,
  baseApis,
  vapis,
}: {
  progress: number;
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
  return (
    <div className="flex flex-col w-full h-full px-1">
      <Timeline progress={progress} />
      <br />
      <br />
      <div className="prose pl-8">
        <h1
          className={classNames({
            'text-gray-300': name == '',
          })}
        >
          {name == '' ? '{Stack}' : name}
        </h1>
        <p
          className={classNames('pl-8', {
            'text-gray-300': description == '',
          })}
        >
          {description == '' ? '...' : description}
        </p>
        {baseApis.length > 0 && (
          <>
            <h2>Base APIs</h2>
            <ul>
              {baseApis.map(({ id, name }) => (
                <li key={`base-api-${id}`}>{name}</li>
              ))}
            </ul>
          </>
        )}
        {vapis.length > 0 && (
          <>
            <h2>VAPIs</h2>
            <ul>
              {vapis.map(({ id, name }) => (
                <li key={`vapi-${id}`}>{name}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
