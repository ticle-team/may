import { trpc } from '@/app/_trpc/client';
import Badge from '@/app/_components/Badge';

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
                      <Badge>
                        RANK:&nbsp;
                        {Math.floor((rel.package?.overallRank ?? 0) * 10) / 10}
                      </Badge>
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
