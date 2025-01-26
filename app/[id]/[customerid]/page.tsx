"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CookingPot } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex justify-center"
    >
      <div className="lg:w-2/4 w-full lg:ml-0 mx-10 mt-24">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">Palaa alkuun</Link>
        </Button>

        {kitchen && (
          <div>
            <h1 className="text-6xl font-black text-primary">{kitchen.kitchenName}</h1>
            <p className="mt-4 text-muted-foreground">{kitchen.info}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {menuDays.slice(0, dayLimit).map((day) => (
            <Button
              key={day.date}
              onClick={() => handleDateChange(day.date)}
              variant={selectedDate === day.date.toString() ? "default" : "outline"}
            >
              {betterFormatDate(day.date)}
            </Button>
          ))}

          {dayLimit <= 7 ? (
            <Button variant="secondary" onClick={() => setDayLimit(dayLimit + 7)}>
              Näytä lisää
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setDayLimit(dayLimit - 7)}>
              Näytä vähemmän
            </Button>
          )}
        </div>

        <div className="relative mt-10">
          <AnimatePresence custom={slideDirection}>
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
                <h2 className="text-4xl font-bold mb-6">{betterFormatDate(selectedMenu.date)}</h2>
                
                {selectedMenu.mealoptions.map((mealOption, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader>
                      <CardTitle>{mealOption.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {mealOption.menuItems.map((item, itemIndex) => (
                          <li 
                            key={itemIndex} 
                            className="flex justify-between items-center"
                          >
                            <span>
                              {item.name} <span className="text-muted-foreground">- {item.portionSize}g</span>
                            </span>
                            <Button 
                              size="icon" 
                              variant="outline"
                              onClick={() => setPopupItem(item)}
                            >
                              <CookingPot size={16} />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="text-center text-muted-foreground mt-10">
                  <p>made with uranium by aapelix</p>
                  <div className="space-x-4">
                    <Link href="https://github.com/aapelix/jamixmenuv3" className="hover:underline">Source code</Link>
                    <Link href="https://buymeacoffee.com/aapelix" className="hover:underline">Support</Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Dialog open={!!popupItem} onOpenChange={() => setPopupItem(null)}>
          {popupItem && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{popupItem.name}</DialogTitle>
              </DialogHeader>
              <DialogDescription 
                dangerouslySetInnerHTML={{ __html: popupItem.ingredients }}
              />
            </DialogContent>
          )}
        </Dialog>
      </div>
    </motion.main>
  );
}