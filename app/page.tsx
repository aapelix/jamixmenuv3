"use client";

import { useEffect, useState } from "react";
import { Customer, Kitchen } from "./interfaces";
import { Search, Star, StarOff } from "lucide-react";
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

interface SearchResult {
  customerId: string;
  kitchenId: string;
  kitchenName: string;
  info: string;
  matchType: 'name' | 'info' | 'partial';
  matchScore: number;
}

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const calculateMatchScore = (
  searchTerm: string,
  kitchenName: string,
  info: string
): number => {
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedName = normalizeText(kitchenName);
  const normalizedInfo = normalizeText(info);

  if (normalizedName === normalizedSearch) return 1;
  
  if (normalizedName.startsWith(normalizedSearch)) return 0.8;
  
  const nameWords = normalizedName.split(' ');
  if (nameWords.some(word => word === normalizedSearch)) return 0.7;
  if (nameWords.some(word => word.startsWith(normalizedSearch))) return 0.6;
  
  if (normalizedName.includes(normalizedSearch)) return 0.5;
  
  if (normalizedInfo.includes(normalizedSearch)) return 0.3;
  
  return 0;
};

const searchKitchens = (
  allKitchens: Customer[],
  searchTerm: string,
  maxResults: number = 10
): SearchResult[] => {
  if (!searchTerm) return [];

  const results: SearchResult[] = [];

  allKitchens.forEach((customer) => {
    customer.kitchens.forEach((kitchen) => {
      const matchScore = calculateMatchScore(
        searchTerm,
        kitchen.kitchenName,
        kitchen.info
      );

      if (matchScore > 0) {
        results.push({
          customerId: customer.customerId,
          kitchenId: kitchen.kitchenId.toString(),
          kitchenName: kitchen.kitchenName,
          info: kitchen.info,
          matchType: matchScore >= 0.7 ? 'name' : matchScore >= 0.5 ? 'partial' : 'info',
          matchScore
        });
      }
    });
  });

  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxResults);
};


export default function Home() {
  const [allKitchens, setAllKitchens] = useState<Customer[]>();
  const [input, setInput] = useState("");
  const [starredKitchens, setStarredKitchens] = useState<{ kitchenId: string; customerId: string }[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);


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
    const handleSearch = () => {
      setIsSearching(true);
      
      if (!input || !allKitchens) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // Debounce search for better performance
      const timeoutId = setTimeout(() => {
        const results = searchKitchens(allKitchens, input);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    };

    handleSearch();
  }, [input, allKitchens]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}       
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.7 }} 
      className="min-h-screen bg-gradient-to-b from-background to-background/95"
    >
      {allKitchens && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
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
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Tervetuloa Jamix Menun avoinlähdekoodiseen versioon. Löydä helposti suosikkipaikkasi ruokalistat ja tallenna ne myöhempää käyttöä varten.
            </p>
          </motion.div>

          <motion.div
            className="relative max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Hae ${allKitchens.length} keittiöstä`}
                className="w-full pl-12 pr-4 h-14 text-lg rounded-2xl border-2 border-primary/20 focus:border-primary transition-all duration-300"
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {starredKitchens.length > 0 && starredKitchens.length > 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 place-content-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
  >
    {starredKitchens.map((starred, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link href={`/${starred.kitchenId}/${starred.customerId}/`}>
          <Card className="h-full relative justify-self-center flex flex-col justify-between transform hover:scale-102 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm border border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                {findKitchenData(allKitchens, starred.customerId, starred.kitchenId).kitchenName}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {findKitchenData(allKitchens, starred.customerId, starred.kitchenId).info}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col justify-end h-full">
                <TodaysMenu customerId={starred.customerId} kitchenId={starred.kitchenId} />
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 hover:bg-primary/10"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleStarred(starred.kitchenId, starred.customerId);
                  }}
                >
                  <StarOff className="text-primary" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    ))}
  </motion.div>
)
}

{searchResults.length > 0 && input.length > 0 && (
      <motion.div
        className="max-w-xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className="backdrop-blur-sm bg-card/50 border border-primary/10">
          <CardContent className="p-4">
            <ul className="space-y-2">
              {searchResults.map((result) => {
                const isStarred = starredKitchens.some(
                  (entry) =>
                    entry.kitchenId === result.kitchenId &&
                    entry.customerId === result.customerId
                );

                return (
                  <motion.li
                    key={`${result.kitchenId}-${result.customerId}`}
                    className="flex flex-col p-3 rounded-xl hover:bg-primary/5 transition-colors duration-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        className="flex-1 font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
                        href={`/${result.kitchenId}/${result.customerId}/`}
                      >
                        {result.kitchenName}
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-4 hover:bg-primary/10"
                        onClick={() => toggleStarred(result.kitchenId, result.customerId)}
                      >
                        {isStarred ? (
                          <StarOff className="text-primary h-5 w-5" />
                        ) : (
                          <Star className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    {result.matchType === 'info' && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {result.info}
                      </p>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    )}
          </AnimatePresence>
        </div>
      )}
    </motion.main>
  );
}
