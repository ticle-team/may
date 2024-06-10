import Button from '@/app/_components/Button';
import { Instance } from '@/models/stack';

type Props = {
  loading: boolean;
  instances: Instance[];
  onClickAddInstanceBtn: () => void;
};

const StackInstances = ({
  loading,
  instances,
  onClickAddInstanceBtn,
}: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold leading-6 text-gray-900">
          Instance List
        </label>
        <Button onClick={onClickAddInstanceBtn}>Create</Button>
      </div>
      <div className="p-4">
        <div className="flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                    >
                      Instance
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      spec
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      region
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="py-10 h-5 text-center">
                        <span className="text-xl font-medium text-primary-600 animate-pulse">
                          Loading...
                        </span>
                      </td>
                    </tr>
                  )}
                  {/* TODO: contents of the table must be modified. */}
                  {!loading &&
                    instances.map((instance) => (
                      <tr key={`instance-${instance.id}`}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-600 text-right">
                          instance#{instance.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 text-center">
                          1
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 text-center">
                          plargeX
                        </td>
                        <td className="relative whitespace-nowrap py-4 px-3 text-sm text-gray-600 text-center">
                          {instance.zone}
                        </td>
                      </tr>
                    ))}
                  {!loading && instances.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-10 text-xl font-medium text-gray-900 sm:pl-0 "
                      >
                        No instances
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackInstances;
