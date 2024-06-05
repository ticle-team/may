import Button from '@/app/_components/Button';
import { FigmaIcon, ServicePlanIcon } from '@/app/_components/Icons';

type Props = {
  onClickAddRefBtn: () => void;
};

const StackReference = ({ onClickAddRefBtn }: Props) => {
  return (
    <div>
      <div className="flex items-center gap-x-4">
        <label className="block text-base font-semibold leading-6 text-gray-900">
          Reference
        </label>
        <Button onClick={onClickAddRefBtn}>Add</Button>
      </div>
      <div className="flex flex-col mt-4 gap-y-4">
        {/* TODO: Implement get reference list feature */}
        <div className="flex gap-x-6">
          <FigmaIcon />
          <span className="font-normal text-sm">와이어프레임 컨셉</span>
          <button className="font-normal text-sm text-indigo-500 hover:cursor-pointer">
            Edit
          </button>
        </div>
        <div className="flex gap-x-6">
          <ServicePlanIcon />
          <span className="font-normal text-sm">서비스 기획서</span>
          <button className="font-normal text-sm text-indigo-500 hover:cursor-pointer">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StackReference;
