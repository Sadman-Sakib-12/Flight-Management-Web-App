export default function FlightResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-5 flex-1">
              <div className="w-11 h-11 skeleton rounded-2xl shrink-0" />
              <div className="flex items-center gap-3 flex-1">
                <div className="space-y-2">
                  <div className="h-7 w-14 skeleton rounded-lg" />
                  <div className="h-3 w-10 skeleton rounded" />
                </div>
                <div className="flex-1 h-px skeleton" />
                <div className="space-y-2">
                  <div className="h-7 w-14 skeleton rounded-lg" />
                  <div className="h-3 w-10 skeleton rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-2 min-w-[140px]">
              <div className="h-7 w-20 skeleton rounded-lg ml-auto" />
              <div className="h-10 w-28 skeleton rounded-xl ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
