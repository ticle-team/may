import RingSpinner from '@/app/_components/RingSpinner';

export default function PageLoading() {
  return (
    <>
      <div className="flex w-full h-full flex-1">
        <div className="grow">
          <div className="flex flex-col items-center h-full">
            <RingSpinner
              shape="with-bg"
              className="flex w-1/5 h-1/5 m-auto fill-primary-600"
            />
          </div>
        </div>
      </div>
    </>
  );
}
