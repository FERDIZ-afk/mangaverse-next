"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Filter } from "lucide-react";

const filterTypes = [
  { id: "all", label: "All Types" },
  { id: "manga", label: "Manga" },
  { id: "manhwa", label: "Manhwa" },
  { id: "manhua", label: "Manhua" },
];

export default function FilterDropdown({ onTypeChange, selectedType = "all" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeSelect = (typeId) => {
    onTypeChange(typeId);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    const selected = filterTypes.find((type) => type.id === selectedType);
    return selected ? selected.label : "All Types";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2 text-gray-400" />
          <span>{getSelectedLabel()}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md shadow-lg bg-gray-800 border border-gray-700 overflow-hidden">
          <div className="py-1 max-h-60 overflow-auto">
            {filterTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors ${
                  selectedType === type.id ? "bg-gray-700" : ""
                }`}
              >
                <span className="text-white">{type.label}</span>
                {selectedType === type.id && (
                  <Check className="h-4 w-4 text-purple-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
