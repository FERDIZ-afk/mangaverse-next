import { WifiOffIcon, RefreshCwIcon } from "lucide-react";

export default function StatusNotice({ offlineMode, showFallbackNotice }) {
  if (offlineMode) {
    return (
      <div className="text-center my-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg flex items-center justify-center gap-2">
        <WifiOffIcon className="h-5 w-5 text-blue-200" />
        <p className="text-blue-200">
          Anda sedang offline. Menampilkan data dari cache lokal.
        </p>
      </div>
    );
  }

  if (showFallbackNotice) {
    return (
      <div className="text-center my-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
        <p className="text-yellow-200 flex items-center justify-center gap-2">
          <RefreshCwIcon className="h-5 w-5 animate-spin" />
          <span>Server sedang lambat. Menampilkan data cache sementara...</span>
        </p>
      </div>
    );
  }

  return null;
}
