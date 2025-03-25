export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-2xl font-medium bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Memuat Konten...
        </p>
        <p className="text-gray-400 mt-3">
          Mohon tunggu sebentar, kami sedang menyiapkan manga terbaik untuk Anda
        </p>
      </div>
    </div>
  );
}
