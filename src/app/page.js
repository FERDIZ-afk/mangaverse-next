"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FilterDropdown from "@/components/FilterDropdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Input,
} from "@/components/ui/";
import { FilterIcon, StarIcon, BookOpenIcon, SearchIcon } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function MangaVerse() {
  const [komiks, setKomiks] = useState([]);
  const [filteredKomiks, setFilteredKomiks] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const fetchKomiks = async (url) => {
    setLoading(true);
    try {
      // Menggunakan API route lokal sebagai proxy
      const apiUrl = url
        ? `/api/komiks?url=${encodeURIComponent(url)}`
        : "/api/komiks";

      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);

      setKomiks((prevKomiks) =>
        url ? [...prevKomiks, ...data.data] : data.data
      );
      setNextPage(data.next_page);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching komiks:", error);
      setLoading(false);
    }
  };

  const fetchKomiksBySearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/komiks?search=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      // console.log(data);

      setKomiks(data.data); // Set komiks dengan data yang baru di-fetch
      setNextPage(data.next_page); // Atur nextPage jika ada
      setLoading(false);
    } catch (error) {
      console.error("Error fetching komiks:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      fetchKomiksBySearch(query); // Panggil fungsi fetch berdasarkan query
    } else {
      fetchKomiks(); // Jika query kosong, ambil semua komik
    }
  };

  useEffect(() => {
    fetchKomiks();
  }, []);

  const handleTypeChange = (type) => {
    setSelectedType(type);

    if (type === "all") {
      setTypeFilter("All");
    } else if (type === "manga") {
      setTypeFilter("Manga");
    } else if (type === "manhwa") {
      setTypeFilter("Manhwa");
    } else if (type === "manhua") {
      setTypeFilter("Manhua");
    }
  };

  useEffect(() => {
    // Filter logic
    let result = komiks;

    // Pastikan data tidak kosong
    if (result.length > 0) {
      // Filter berdasarkan type
      if (typeFilter !== "All") {
        result = result.filter((komik) => komik.type === typeFilter);
      }

      // Filter berdasarkan query pencarian
      if (searchQuery) {
        result = result.filter((komik) =>
          komik.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    setFilteredKomiks(result);
  }, [komiks, typeFilter, searchQuery]);

  const loadMoreKomiks = () => {
    if (nextPage) {
      fetchKomiks(nextPage);
    }
  };

  const getColorForRating = (rating) => {
    const parsedRating = parseFloat(rating);
    if (parsedRating >= 8) return "bg-green-500";
    if (parsedRating >= 7) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* <Navbar /> */}
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            MangaVerse
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Website masih dalam tahap pengembangan
          </p>
          <p className="text-center text-gray-400 mb-6">
            tolong refresh kembali jika komik tidak ditampilkan
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Input
                icon={<SearchIcon className="text-gray-500" />}
                placeholder="Search manga..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="w-full md:w-48">
              <FilterDropdown
                onTypeChange={handleTypeChange}
                selectedType={selectedType}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredKomiks.map((komik) => (
            <Link href={`/manga/${komik.param}`} key={komik.param}>
              <Card className="bg-gray-800 border-gray-700 hover:scale-105 transition-transform cursor-pointer h-full">
                <div className="relative">
                  <Image
                    src={komik.thumbnail}
                    alt={komik.title}
                    width={300}
                    height={400}
                    className="w-full h-64 object-cover rounded-t-lg"
                    quality={80}
                    priority={true}
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${getColorForRating(
                      komik.rating
                    )}`}
                  >
                    <StarIcon className="h-4 w-4 mr-1" />
                    {komik.rating}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-bold truncate text-white mb-1">
                    {komik.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-gray-700">
                      <BookOpenIcon className="h-3 w-3 mr-1" />
                      {komik.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="text-center my-8">
            <p className="text-xl animate-pulse">Loading more manga...</p>
          </div>
        )}

        {nextPage && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMoreKomiks}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Load More Manga
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
