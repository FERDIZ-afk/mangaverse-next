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
import SearchButton from "@/components/SearchKomik";

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
          {/* <SearchButton /> */}
          {/* <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            MangaVerse
          </h1> */}
          {/* <p className="text-center text-gray-400 mb-6">
            Website masih dalam tahap pengembangan
          </p>
          <p className="text-center text-gray-400 mb-6">
            tolong refresh kembali jika komik tidak ditampilkan
          </p> */}

          <div className="w-[90%] sm:w-95% m-auto">
            <section id="carousel" className="sm:px-10 px-3 mt-12 sm:mt-20 ">
              <div className="sm:grid sm:grid-cols-4 gap-10">
                <div className="info sm:col-span-3 py-3 sm:mt-5">
                  <div className="title">
                    <h1 className="text-white font-noto-sans text-2xl sm:text-4xl ">
                      Ore no Ie ga Maryoku Spot Datta Ken: Sundeiru dake de
                      Sekai Saikyou
                    </h1>
                    <p className="mt-5 text-white font-medium font-open-sans w-full text-sm sm:text-base sm:w-[80%]">
                      Hidup riang di rumah adalah cara pintas terbesar — rumah
                      saya adalah Tempat Daya Ajaib terbesar di dunia. Itulah
                      yang terjadi, baik rumah saya dan saya dipanggil ke dunia
                      lain oleh beberapa orang yang membidiknya. Namun, saya
                      telah tinggal di tempat ini selama bertahun-tahun dan
                      tubuh saya, tampaknya, terlalu meluap dengan sihir. Karena
                      keadaan yang tak terduga oleh orang-orang yang
                      memanggilku, mereka dengan cepat melarikan diri. Meskipun
                      begitu, masih ada beberapa orang yang tidak sopan yang
                      mengingini sihir yang bocor keluar dari rumahku. Saya
                      tidak akan menyerahkan rumah saya kepada orang-orang itu!
                      Saya akan menggunakan kekuatan saya sesuka saya!
                    </p>

                    <Link href="/manga/ore-no-ie-ga-maryoku-spot-datta-ken-sundeiru-dake-de-sekai-saikyou">
                      <button className="text-white px-4 py-2 text-sm  rounded-sm ring-1 ring-[#FF7F57] mt-8 flex items-center gap-3 font-montserrat font-medium sm:text-base">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                          />
                        </svg>

                        <span className="dark:text-white text-zinc-950">
                          Read Now
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="sm:col-span-1 hidden sm:block">
                  <div className="images ">
                    <Image
                      src="https://i0.wp.com/www.maid.my.id/wp-content/uploads/2018/07/e1d0db35-b6fb-4a5f-bf6b-127cd8758324.jpg"
                      alt="test"
                      width={150}
                      height={150}
                      referrerPolicy="no-referrer"
                      className="w-full rounded-lg rotate-3 h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            MangaVerse
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Website masih dalam tahap pengembangan
          </p>
          <p className="text-center text-gray-400 mb-6">
            tolong refresh kembali jika komik tidak ditampilkan
          </p> */}

          {/* <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          </div> */}
          {/* <SearchButton /> */}
          <div className="flex justify-between mt-4">
            <div className="title">
              <h1 className="text-lg font-noto-sans sm:text-2xl text-white">
                Latest Updated
              </h1>
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
