export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-zinc-700 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-zinc-700 rounded-lg animate-pulse"></div>
      </div>
      
      {/* Search skeleton */}
      <div className="h-10 w-full max-w-md bg-zinc-700 rounded-lg animate-pulse"></div>
      
      {/* Table skeleton */}
      <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                </th>
                <th className="px-4 py-3 text-center">
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b border-zinc-700">
                  <td className="px-4 py-3">
                    <div className="h-4 w-12 bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <div className="h-8 w-8 bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
