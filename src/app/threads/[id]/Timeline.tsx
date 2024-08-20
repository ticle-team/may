import { useMemo } from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';
import { CheckCircleIcon, StopIcon } from '@heroicons/react/24/solid';

export function Timeline({ progress }: { progress: number }) {
  const stepTitles = [
    'Service planning',
    'Service statement',
    'API recommendation',
    'API creation',
    'Stack configuration',
    'Stack deployment',
  ] as const;
  const steps = useMemo(() => {
    return _.range(1, 6 + 1).map((i) => {
      return {
        title: stepTitles[i - 1],
        beforeCompleted: i - 1 <= progress,
        completed: i <= progress,
        afterCompleted: i + 1 <= progress,
      };
    });
  }, [progress]);
  const maxSteps = steps.length;

  return (
    <div className="flex gap-0 w-full">
      {steps.map(({ beforeCompleted, completed, afterCompleted, title }, i) => (
        <div
          className={classNames('flex flex-row items-center', {
            'min-w-fit': i === 0,
            'w-full': i > 0,
          })}
          key={`timeline-step-${i}`}
        >
          <hr
            className={classNames('grow border-primary-500', {
              hidden: i === 0,
              border: i !== 0,
              // 'border': beforeCompleted && completed,
              'border-dashed': !beforeCompleted || !completed,
            })}
          />
          {completed ? (
            <div className="flex rounded-full justify-center items-center w-7 h-7 bg-primary-500 mr-0.5">
              <div className="flex rounded-full items-center justify-center w-3.5 h-3.5 bg-white" />
            </div>
          ) : (
            <div className="flex rounded-full justify-center items-center w-7 h-7 border border-dashed border-primary-500 mr-0.5" />
          )}
          <div className="flex px-2 text-sm font-bold text-semiblack">
            <span className="text-center">{title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
