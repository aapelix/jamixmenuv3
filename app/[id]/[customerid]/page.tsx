"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function betterFormatDate(dateStr: string | number): string {
  if (typeof dateStr === "number") {
    dateStr = dateStr.toString();
  }

  if (typeof dateStr !== "string" || dateStr.length !== 8) {
    throw new Error("Invalid date string format");
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);

  const date = new Date(year, month, day);

  const daysOfWeek = [
    "Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];

  const formattedDay = day.toString().padStart(2, "0");
  const formattedMonth = (month + 1).toString().padStart(2, "0");

  return `${dayOfWeek} ${formattedDay}.${formattedMonth}`;
}

export default function Id() {
  const { id, customerid } = useParams();

  const [kitchenData, setKitchenData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupItem, setPopupItem] = useState(null);
  const [slideDirection, setSlideDirection] = useState("right");
  const [dayLimit, setDayLimit] = useState(7);

  const fetchKitchenData = async () => {
    const res = await fetch(
      `https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/${customerid}/${id}?lang=fi`,
    );
    const data = await res.json();
    setKitchenData(data);

    const menuDays = data[0]?.menuTypes[0]?.menus[0]?.days || [];
    if (menuDays.length > 1) {
      setSelectedDate(
        menuDays[[1, 0, 6].includes(new Date().getDay()) ? 0 : 1].date.toString()
      );
    }
  };

  useEffect(() => {
    fetchKitchenData();
  }, []);

  const handleDateChange = (date) => {
    setSlideDirection(date > selectedDate ? "right" : "left");
    setSelectedDate(date.toString());
  };

  const kitchen = kitchenData[0];
  const menuDays = kitchen?.menuTypes?.[0]?.menus?.[0]?.days || [];
  const selectedMenu = menuDays.find((day) => day.date.toString() === selectedDate);

  const slideVariants = {
    enter: (direction) => ({ x: direction === "right" ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction === "right" ? -500 : 500, opacity: 0 }),
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}       
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-b from-background to-background/95"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" asChild className="mb-8 group">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Palaa alkuun
            </Link>
          </Button>
        </motion.div>

        {kitchen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl py-2 md:text-6xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {kitchen.kitchenName}
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">{kitchen.info}</p>
          </motion.div>
        )}

        <motion.div 
          className="mt-12 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {menuDays.slice(0, dayLimit).map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => handleDateChange(day.date)}
                variant={selectedDate === day.date.toString() ? "default" : "outline"}
                className="transition-all duration-300 hover:scale-105"
              >
                {betterFormatDate(day.date)}
              </Button>
            </motion.div>
          ))}

          <Button 
            variant="secondary"
            onClick={() => setDayLimit(dayLimit <= 7 ? dayLimit + 7 : dayLimit - 7)}
            className="transition-all duration-300 hover:scale-105"
          >
            {dayLimit <= 7 ? "Näytä lisää" : "Näytä vähemmän"}
          </Button>
        </motion.div>

        <div className="relative mt-12 min-h-[400px]">
          <AnimatePresence mode="wait" custom={slideDirection}>
            {selectedMenu && (
              <motion.div
                key={selectedMenu.date}
                className="absolute top-0 left-0 w-full"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-primary/80">
                  {betterFormatDate(selectedMenu.date)}
                </h2>
                
                {selectedMenu.mealoptions.map((mealOption, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="mb-6 backdrop-blur-sm bg-card/50 border border-primary/10 hover:border-primary/20 transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">
                          {mealOption.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {mealOption.menuItems.map((item, itemIndex) => (
                            <motion.li 
                              key={itemIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: itemIndex * 0.05 }}
                              className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors duration-200"
                            >
                              <span className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {item.portionSize}g
                                </span>
                              </span>
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => setPopupItem(item)}
                                className="hover:bg-primary/10 transition-colors duration-200"
                              >
                                <CookingPot className="w-4 h-4" />
                              </Button>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                <motion.footer
                  className="text-center text-muted-foreground mt-16 pt-8 border-t border-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="mb-4">made with uranium by aapelix</p>
                  <div className="space-x-6">
                    <Link 
                      href="https://github.com/aapelix/jamixmenuv3" 
                      className="text-primary/60 hover:text-primary transition-colors duration-200"
                    >
                      Source code
                    </Link>
                    <Link 
                      href="https://buymeacoffee.com/aapelix" 
                      className="text-primary/60 hover:text-primary transition-colors duration-200"
                    >
                      Support
                    </Link>
                  </div>
                </motion.footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Dialog open={!!popupItem} onOpenChange={() => setPopupItem(null)}>
          {popupItem && (
            <DialogContent className="backdrop-blur-md bg-background/95">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">
                  {popupItem.name}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: popupItem.ingredients }}
              />
            </DialogContent>
          )}
        </Dialog>
      </div>
    </motion.main>
  );
}