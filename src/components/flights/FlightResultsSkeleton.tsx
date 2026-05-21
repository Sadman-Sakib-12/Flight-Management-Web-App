export default function FlightResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-4 flex-1">
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-2 min-w-[140px]">
              <div className="h-8 w-24 bg-gray-200 rounded ml-auto" />
              <div className="h-10 w-24 bg-gray-200 rounded ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
