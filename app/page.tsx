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
    <motion.main initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1}} className="w-full h-full flex justify-center">
      {allKitchens && (
        <div className="lg:w-2/4 w-full lg:ml-0 mx-10 mt-24">
          <h1 className="text-5xl font-black">Hyvää aamupäivää</h1>
          <p className="mt-2 text-zinc-300 w-2/3 lg:block hidden">
            Tämä nettisivu
            <a href="jamix.aapelix.dev"> (jamix.aapelix.dev</a> tai JamixMenuv3)
            on uudempi (parempi) versio jamixmenu.com sovelluksesta, jonka
            tarkoituksena on olla netistä löytyvä ruokalista, joka sisältää
            monen suomalaisen koulun (ja muun) jokapäivän ruokalistan.
          </p>

          <p className="mt-2 text-zinc-300 w-2/3 lg:hidden block">
            Tämä netti sivu on vasta beta-vaiheessa!
          </p>

          {starredKitchens.length > 0 && (
            <>
            <div className="flex flex-wrap gap-2 mt-5">
              {starredKitchens.map((starred, index) => {

                return (
                  <a href={
                    "/" +
                    starred.kitchenId +
                    "/" +
                    starred.customerId +
                    "/"
                  } className="w-44 h-44 bg-blue-800 rounded-3xl p-4 relative hover:scale-110 duration-300" key={index}>
                    <h1 className="font-bold">{findKitchenName(allKitchens, starred.customerId, starred.kitchenId)}</h1>
                    <TodaysMenu customerId={starred.customerId} kitchenId={starred.kitchenId} />
                  </a>
                )
                
              })}
            </div>
            </>
          )}

          <input
            type="search"
            autoComplete="false"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hae keittiöitä"
            className="mt-5 p-2 px-6 rounded-full bg-blue-500 focus:text-black w-56 placeholder:text-gray-200 lg:focus:w-96 focus:w-60 duration-300 focus:bg-white focus:placeholder:text-zinc-500"
          />
          <AnimatePresence>
          {searchSuggestions && input.length > 0 && (
            <motion.ul 
              className="bg-blue-500 mt-2 px-5 p-2 rounded-3xl"
              initial={{ opacity: 0, y: -1 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -1 }}
              transition={{ duration: 0.1 }}
            >
              <AnimatePresence>
              {searchSuggestions?.map((kitchen: Customer, index: number) => {
                const isStarred = starredKitchens.some(
                  (entry) => entry.kitchenId === kitchen.kitchens[0].kitchenId.toString() && entry.customerId === kitchen.customerId,
                );

                return (
                  <motion.li className="flex justify-between items-center"
                    key={kitchen.kitchens[0].kitchenId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>

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
