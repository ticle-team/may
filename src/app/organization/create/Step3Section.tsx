export default function Step3Section() {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Welcome!</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            앞으로 MAY와 함께 다양한 애플리케이션을 손쉽게 만들어보세요!
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl ">
          <img
            src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3270&q=80"
            className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
          />
        </div>
        <div className="mt-10">
          <button
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            지금 바로 애플리케이션 만들러가기
          </button>
        </div>
      </div>
    </div>
  )
}
