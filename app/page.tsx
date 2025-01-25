"use client";

import { useEffect, useState } from "react";
import { Customer, Kitchen } from "./interfaces";
import { Star, StarOff } from "lucide-react";
import TodaysMenu from "./TodaysMenu";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const findKitchenData = (
  allKitchens: Customer[],
  customerId: string,
  kitchenId: string
): Kitchen | undefined => {
  const customer = allKitchens?.find(
    (customer) => customer.customerId === customerId
  );

  const kitchen = customer?.kitchens.find(
    (kitchen) => kitchen.kitchenId.toString() === kitchenId
  );

  return kitchen ?? undefined;
};

export default function Home() {
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
    <motion.main 
      initial={{ opacity: 0, y: 20 }}       
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="w-full h-full flex justify-center"
    >
      {allKitchens && (
        <div className="lg:w-2/4 w-full lg:ml-0 mx-10 mt-24">
          <motion.h1
            className="text-6xl font-black bg-gradient-to-r from-primary to-primary*2 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {`Hyvää ${(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 10) return 'aamua';
              if (hour >= 10 && hour < 12) return 'aamupäivää';
              if (hour >= 12 && hour < 14) return 'päivää';
              if (hour >= 14 && hour < 17) return 'iltapäivää';
              if (hour >= 17 && hour < 23) return 'iltaa';
              return 'yötä';
            })()}`}
          </motion.h1>

          <p className="mt-4 text-muted-foreground w-2/3 lg:block hidden leading-relaxed">
            Tämä nettisivu
            (<a href="https://jamix.aapelix.dev" className="text-primary hover:text-primary/20 transition-colors duration-300">jamix.aapelix.dev</a> tai JamixMenuV3)
            on uudempi (parempi) versio jamixmenu.com sovelluksesta, jonka
            tarkoituksena on olla netistä löytyvä ruokalista, joka sisältää
            monen suomalaisen koulun (ja muun) jokapäivän ruokalistan.
          </p>

          <p className="mt-4 text-muted-foreground w-2/3 lg:hidden block leading-relaxed">
            Tämä nettisivu on vasta beta-vaiheessa!
          </p>

          {starredKitchens.length > 0 && (
  <motion.div
    className="flex flex-col gap-3 mt-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {starredKitchens.map((starred, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Link href={`/${starred.kitchenId}/${starred.customerId}/`} passHref>
          <Card className="hover:scale-105 duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle>
                {findKitchenData(allKitchens, starred.customerId, starred.kitchenId).kitchenName}
              </CardTitle>
              <CardDescription>
                {findKitchenData(allKitchens, starred.customerId, starred.kitchenId).info}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <TodaysMenu customerId={starred.customerId} kitchenId={starred.kitchenId} />
              <Button
                className="absolute bottom-2 right-2"
                onClick={(e) => {
                  e.preventDefault();
                  toggleStarred(starred.kitchenId, starred.customerId);
                }}
              >
                <StarOff />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    ))}
  </motion.div>
)}



<motion.div
  className="relative mt-8"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  <Input
    type="search"
    autoComplete="false"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder={`Hae ${allKitchens.length} keittiöstä`}
    className="p-3 px-6 w-56 focus:w-96 duration-300"
  />
</motion.div>


{searchSuggestions && input.length > 0 && (
  <motion.div
    className="mt-4 pt-4 text-muted-foreground shadow-lg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    <Card>
      <CardContent>
        <ul>
          {searchSuggestions?.map((kitchen: Customer, index: number) => {
            const isStarred = starredKitchens.some(
              (entry) =>
                entry.kitchenId === kitchen.kitchens[0].kitchenId.toString() &&
                entry.customerId === kitchen.customerId
            );

            return (
              <motion.li
                className="flex justify-between items-center mt-2 p-3 rounded-lg bg-border/10"
                key={kitchen.kitchens[0].kitchenId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  className="hover:font-bold duration-300"
                  href={`/${kitchen.kitchens[0].kitchenId}/${kitchen.customerId}/`}
                >
                  {kitchen.kitchens[0].kitchenName}
                </Link>

                <Button
                  variant="ghost"
                  className="hover:scale-110 duration-300"
                  onClick={() => {
                    toggleStarred(kitchen.kitchens[0].kitchenId.toString(), kitchen.customerId);
                  }}
                >
                  {isStarred ? <StarOff className="text-primary" /> : <Star />}
                </Button>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  </motion.div>
)}



        </div>
      )}
    </motion.main>
  );
}
