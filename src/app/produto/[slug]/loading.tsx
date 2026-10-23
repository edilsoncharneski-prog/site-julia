export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white py-6 sm:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="mb-6 h-5 w-40 animate-pulse bg-gray-100" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="aspect-square w-full animate-pulse bg-[#f7f7f5]" />
          <div className="flex flex-col gap-4 py-4">
            <div className="h-4 w-32 animate-pulse bg-gray-100" />
            <div className="h-9 w-3/4 animate-pulse bg-gray-100" />
            <div className="mt-4 h-24 w-full animate-pulse bg-gray-100" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-gray-100" />
              ))}
            </div>
            <div className="mt-6 h-14 w-full animate-pulse bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
