import { trpc } from '@/app/_trpc/client';
import classNames from 'classnames';

const { Tooltip } = require('flowbite-react');

function Badge({ rank = 0 }: { rank?: number }) {
  const style = {
    '--low-color': '#ef4444',
    '--ring-low-color': 'rgb(239 68 68 / 0.1)',
    '--middle-color': '#fbbf24',
    '--ring-middle-color': 'rgb(251 191 36 / 0.1)',
    '--high-color': '#22c55e',
    '--ring-high-color': 'rgb(34 197 94 / 0.1)',
    '--incs': 'oklch',
    '--normed': `${rank}%`,
    '--n1': 'calc((var(--normed) - 50%) * 2)',
    '--n2': 'calc(var(--normed)*2)',
    color: `color-mix(
      in var(--incs),
      color-mix(in var(--incs), var(--high-color) var(--n1), var(--middle-color)) var(--normed),
      color-mix(in var(--incs), var(--middle-color) var(--n2), var(--low-color))
    )`,
    '--tw-ring-color': `color-mix(
      in var(--incs),
      color-mix(in var(--incs), var(--ring-high-color) var(--n1), var(--ring-middle-color)) var(--normed),
      color-mix(in var(--incs), var(--ring-middle-color) var(--n2), var(--ring-low-color))
    )`,
  };

  return (
    <>
      <span
        data-tooltip-target="tooltip-right"
        data-tooltip-placement="right"
        style={style}
        className={classNames(
          'inline-flex items-center rounded-md bg-gray-50 text-xs font-medium ring-1 ring-inset',
        )}
      >
        <Tooltip
          content="Score for each API is determined by code integrity & security, reusability, and community rating"
          placement="bottom"
          style="light"
        >
          <span className="flex flex-1 px-2 py-1">
            Score:&nbsp;{Math.floor((rank ?? 0) * 10) / 10}
          </span>
        </Tooltip>
      </span>
    </>
  );
}

export default function StackContainer({
  name,
  description,
  baseApis,
  vapis,
}: {
  name: string;
  description: string;
  baseApis: {
    name: string;
  }[];
  vapis: {
    name: string;
  }[];
}) {
  const { data: vapiReleases, error } =
    trpc.vapi.getLatestReleasesByNames.useQuery({
      names: vapis.map(({ name }) => name),
    });
  if (error) {
    console.warn('trpc.vapi.getLatestReleasesByNames error: ', error);
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
                  {baseApis.map(({ name }, idx) => (
                    <li className="text-slate-500" key={`base-api-${idx}`}>
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
                        <a
                          className="text-gray-400 hover:text-gray-300"
                          href={rel.package?.author?.profileUrl}
                        >
                          @{rel.package?.author?.name}
                        </a>
                      )}
                      <Badge rank={rel.package?.overallRank} />
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
