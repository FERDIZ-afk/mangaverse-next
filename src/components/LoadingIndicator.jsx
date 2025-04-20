export default function LoadingIndicator({ initial = false }) {
  if (initial) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="text-center my-8">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-t-orange-500 border-r-transparent border-b-orange-500 border-l-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-400">Memuat data lainnya...</p>
      </div>
    </div>
  );
}
