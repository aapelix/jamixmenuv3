"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Kitchen = {
  kitchenName: string;
  kitchenId: number;
  address: string;
  city: string;
  email: string;
  phone: string;
  info: string;
  menuTypes: any[];
};

type Customer = {
  customerId: string;
  kitchens: Kitchen[];
};

export default function Home() {
  const [jamixCustomerId, setJamixCustomerId] = useState<Number>();
  const [selectedKitchen, setSelectedKitchen] = useState<Number>();
  const [allKitchens, setAllKitchens] = useState<Customer[]>();
  const [input, setInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Kitchen[]>();

  const filterKitchensByName = (
    data: Customer[],
    kitchenName: string,
  ): Kitchen[] => {
    return data.flatMap((customer) =>
      customer.kitchens.filter(
        (kitchen) =>
          kitchen.kitchenName.toLowerCase() === kitchenName.toLowerCase(),
      ),
    );
  };

  const fetchAllKitchens = async () => {
    const res = await fetch(
      "https://fi.jamix.cloud/apps/menuservice/rest/haku/public",
    );
    const data = await res.json();

    setAllKitchens(data);
  };

  useEffect(() => {
    fetchAllKitchens();
  }, []);

  useEffect(() => {
    if (input && allKitchens) {
      const filteredCustomers = allKitchens.filter((customer) =>
        customer.kitchens[0].kitchenName
          .toLowerCase()
          .startsWith(input.toLowerCase()),
      );

      setSearchSuggestions(filteredCustomers);
    }
  }, [input, allKitchens]);

  return (
    <main className="w-full h-full flex justify-center">
      {allKitchens && (
        <div className="lg:w-2/4 w-full lg:ml-0 mx-10 mt-24">
          <h1 className="text-5xl font-black">Hyvää aamupäivää</h1>
          <p className="mt-2 text-zinc-300 w-2/3">
            Tämä nettisivu
            <a href="jamix.aapelix.dev"> (jamix.aapelix.dev</a> tai JamixMenuv3)
            on uudempi (parempi) versio jamixmenu.com sovelluksesta, jonka
            tarkoituksena on olla netistä löytyvä ruokalista, joka sisältää
            erittäin monen suomalaisen koulun jokapäivän ruokalistan.
          </p>

          <input
            type="search"
            autoComplete="false"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hae keittiöitä"
            className="mt-5 p-2 px-6 rounded-full bg-blue-500 focus:text-black w-56 placeholder:text-gray-200 lg:focus:w-96 focus:w-60 duration-300 focus:bg-white focus:placeholder:text-zinc-500"
          />
          {searchSuggestions && (
            <ul className="bg-blue-500 mt-2 px-5 p-2 rounded-3xl">
              {searchSuggestions?.map((kitchen: Customer, index) => (
                <li key={index}>
                  <a
                    href={
                      "/" +
                      kitchen.kitchens[0].kitchenId +
                      "/" +
                      kitchen.customerId +
                      "/"
                    }
                  >
                    {kitchen.kitchens[0].kitchenName}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
