export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#636AE8] mb-4"></div>
      <p className="text-gray-500">Loading project details...</p>
    </div>
  )
}
