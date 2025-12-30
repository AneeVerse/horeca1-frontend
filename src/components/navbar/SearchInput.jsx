"use client";

import { Input } from "@components/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SearchInput = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchText) {
      router.push(`/search?query=${searchText}`, { scroll: true });
      setSearchText("");
    } else {
      router.push(`/`, { scroll: true });
      setSearchText("");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="relative pr-12 md:pr-14 bg-white overflow-hidden shadow-sm rounded-md w-full"
      >
        <label className="flex items-center py-0.5">
          <Input
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            className="form-input w-full pl-5 appearance-none transition ease-in-out text-sm text-gray-700 font-sans rounded-md h-9 duration-200 bg-white focus:ring-0 outline-none border-none focus:outline-none"
            placeholder="Search for products"
          />
        </label>
        <button
          aria-label="Search"
          type="submit"
          className="outline-none text-xl text-gray-400 absolute top-0 right-0 end-0 w-12 md:w-14 h-full flex items-center justify-center transition duration-200 ease-in-out hover:text-heading focus:outline-none"
        >
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </form>
    </>
  );
};

export default SearchInput;

