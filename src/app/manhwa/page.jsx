"use client";

import { useState } from "react";
import { BookIcon } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ComicCard from "@/components/ComicCard";
import StatusNotice from "@/components/StatusNotice";
import ErrorDisplay from "@/components/ErrorDisplay";
import LoadingIndicator from "@/components/LoadingIndicator";
import useComicFetch from "@/hooks/useComicFetch";

export default function ManhwaPage() {
  const [isRefetching, setIsRefetching] = useState(false);

  const {
    comicList,
    loading,
    error,
    hasMore,
    loadMoreRef,
    offlineMode,
    showFallbackNotice,
    refetch,
  } = useComicFetch("manhwa");

  const handleRefetch = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-8">
      <div className="container mx-auto px-4">
        <PageTitle
          title="Manhwa"
          icon={<BookIcon className="h-6 w-6 text-purple-500" />}
        />

        <StatusNotice
          offlineMode={offlineMode}
          showFallbackNotice={showFallbackNotice}
        />

        {error ? (
          <ErrorDisplay
            error={error}
            refetch={handleRefetch}
            isRefetching={isRefetching}
          />
        ) : (
          <>
            {loading && comicList.length === 0 ? (
              <LoadingIndicator initial={true} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                  {comicList.map((manhwa, index) => (
                    <ComicCard
                      key={`${manhwa.slug}-${index}`}
                      comic={manhwa}
                      type="manhwa"
                    />
                  ))}
                </div>

                {/* Loading indicator for infinite scroll */}
                {loading && comicList.length > 0 && <LoadingIndicator />}

                {/* Reference element for intersection observer */}
                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="h-10 w-full"
                    aria-hidden="true"
                  ></div>
                )}

                {!hasMore && comicList.length > 0 && (
                  <p className="text-center text-gray-400 mt-8">
                    Anda telah mencapai akhir halaman!
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
