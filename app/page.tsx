"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Customer, Kitchen } from "./interfaces";
import { Star, StarOff } from "lucide-react";
import TodaysMenu from "./TodaysMenu";
import { AnimatePresence, motion } from "motion/react";

const findKitchenName = (
  allKitchens: Customer[],
  customerId: string,
  kitchenId: string
): string | undefined => {
  const customer = allKitchens?.find(
    (customer) => customer.customerId === customerId
  );

  const kitchen = customer?.kitchens.find(
    (kitchen) => kitchen.kitchenId.toString() === kitchenId
  );

  return kitchen?.kitchenName;
};

export default function Home() {
  const [jamixCustomerId, setJamixCustomerId] = useState<Number>();
  const [selectedKitchen, setSelectedKitchen] = useState<Number>();
  const [allKitchens, setAllKitchens] = useState<Customer[]>();
  const [input, setInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any>();
  const [starredKitchens, setStarredKitchens] = useState<{ kitchenId: string; customerId: string }[]>([]);


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

  const loadStarredKitchens = () => {
    const saved = localStorage.getItem("starredKitchens");
    if (saved) {
      setStarredKitchens(JSON.parse(saved));
    }
  };


  const toggleStarred = (kitchenId: string, customerId: string) => {
    const isStarred = starredKitchens.some(
      (entry) => entry.kitchenId === kitchenId && entry.customerId === customerId,
    );

    const updatedStarred = isStarred
      ? starredKitchens.filter(
        (entry) => !(entry.kitchenId === kitchenId && entry.customerId === customerId),
      )
      : [...starredKitchens, { kitchenId, customerId }];

    setStarredKitchens(updatedStarred);
    localStorage.setItem("starredKitchens", JSON.stringify(updatedStarred));
  };


  useEffect(() => {
    fetchAllKitchens();
    loadStarredKitchens();
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
    <motion.main initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ duration: 0.5 }} 
                 className="w-full h-full flex justify-center">
      {allKitchens && (
        <div className="lg:w-2/4 w-full lg:ml-0 mx-10 mt-24">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {`Hyvää ${(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 10) return 'aamua';
              if (hour >= 10 && hour < 12) return 'aamupäivää';
              if (hour >= 12 && hour < 14) return 'päivää';
              if (hour >= 14 && hour < 17) return 'iltapäivää';
              if (hour >= 17 && hour < 23) return 'iltaa';
              return 'yötä';
            })()}`}
          </h1>
          <p className="mt-4 text-zinc-300 w-2/3 lg:block hidden leading-relaxed">
            Tämä nettisivu
            (<a href="https://jamix.aapelix.dev" className="text-blue-400 hover:text-blue-500 transition-colors duration-300">jamix.aapelix.dev</a> tai JamixMenuV3)
            on uudempi (parempi) versio jamixmenu.com sovelluksesta, jonka
            tarkoituksena on olla netistä löytyvä ruokalista, joka sisältää
            monen suomalaisen koulun (ja muun) jokapäivän ruokalistan.
          </p>

          <p className="mt-4 text-zinc-300 w-2/3 lg:hidden block leading-relaxed">
            Tämä netti sivu on vasta beta-vaiheessa!
          </p>

          {starredKitchens.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-8">
              {starredKitchens.map((starred, index) => (
                <a href={`/${starred.kitchenId}/${starred.customerId}/`} 
                   className="w-44 h-44 bg-[#1a1a1a]/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 relative hover:scale-105 duration-300" 
                   key={index}>
                  <h1 className="font-bold text-blue-400">{findKitchenName(allKitchens, starred.customerId, starred.kitchenId)}</h1>
                  <TodaysMenu customerId={starred.customerId} kitchenId={starred.kitchenId} />
                </a>
              ))}
            </div>
          )}

          <input
            type="search"
            autoComplete="false"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hae keittiöitä"
            className="mt-8 p-3 px-6 rounded-2xl bg-[#1a1a1a] border border-white/10 focus:text-white w-56 placeholder:text-gray-400 lg:focus:w-96 focus:w-60 duration-300 focus:bg-[#252525] focus:placeholder:text-zinc-500 outline-none"
          />

          <AnimatePresence>
            {searchSuggestions && input.length > 0 && (
              <motion.ul
                className="bg-[#1a1a1a]/50 backdrop-blur-sm border border-white/10 mt-3 px-5 p-4 rounded-2xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence>
                  {searchSuggestions?.map((kitchen: Customer, index: number) => {
                    const isStarred = starredKitchens.some(
                      (entry) => entry.kitchenId === kitchen.kitchens[0].kitchenId.toString() && entry.customerId === kitchen.customerId,
                    );

                    return (
                      <motion.li className="flex justify-between items-center mt-1"
                        key={kitchen.kitchens[0].kitchenId}
                        >
                        <a
                          className="hover:font-bold duration-300"
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

                        <button className="hover:scale-110 duration-300" onClick={() => {
                          toggleStarred(kitchen.kitchens[0].kitchenId.toString(), kitchen.customerId)
                        }}>
                          {isStarred ? <StarOff /> : <Star />}
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.main>
  );
}
