"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CookingPot } from "lucide-react";

function betterFormatDate(dateStr: string | number): string {
  if (typeof dateStr === "number") {
    dateStr = dateStr.toString();
  }

  if (typeof dateStr !== "string" || dateStr.length !== 8) {
    throw new Error("Invalid date string format");
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Months are zero-based in JavaScript
  const day = parseInt(dateStr.substring(6, 8), 10);

  const date = new Date(year, month, day);

  const daysOfWeek = [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];

  const formattedDay = day.toString().padStart(2, "0");
  const formattedMonth = (month + 1).toString().padStart(2, "0");

  return `${dayOfWeek} ${formattedDay}.${formattedMonth}`;
}

// Pop-Up Component
const IngredientPopup = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-8 rounded-2xl shadow-xl lg:w-1/2 w-full mx-5 max-w-lg border border-white/10"
      >
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{item.name}</h2>
        <div
          className="text-zinc-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.ingredients }}
        />
        <button
          className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
          onClick={onClose}
        >
          Sulje
        </button>
      </motion.div>
    </motion.div>
  );
};

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
      if (new Date().getDay() == 1) {
        setSelectedDate(menuDays[0].date.toString());
      } else {
        setSelectedDate(menuDays[1].date.toString());
      }
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

  const selectedMenu = menuDays.find(
    (day) => day.date.toString() === selectedDate,
  );

  const slideVariants = {
    enter: (direction) => ({
      x: direction === "right" ? 500 : -500,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === "right" ? -500 : 500,
      opacity: 0,
    }),
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen flex justify-center pb-10"
    >
      <div className="lg:w-2/4 w-full mt-24 mx-10">
        <a className="text-zinc-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 mb-8" href="/">
          Palaa alkuun
        </a>
        {kitchen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-black text-6xl bg-gradient-to-r from-blue-500 to-purple-500 py-1 bg-clip-text text-transparent">{kitchen.kitchenName}</h1>
            <p className="mt-4 text-zinc-300 w-2/3 leading-relaxed">{kitchen.info}</p>
          </motion.div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {menuDays.slice(0, dayLimit).map((day) => (
            <button
              key={day.date}
              onClick={() => handleDateChange(day.date)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
                selectedDate === day.date.toString()
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-[#1a1a1a] hover:bg-[#252525]"
              }`}
            >
              {betterFormatDate(day.date)}
            </button>
          ))}

          <button onClick={() => setDayLimit(dayLimit + 7)} style={{display: dayLimit <= 7 ? "block" : "none"}} className="text-zinc-300 hover:font-bold duration-300">Näytä lisää</button>
          <button onClick={() => setDayLimit(dayLimit - 7)} style={{display: dayLimit <= 7 ? "none" : "block"}} className="text-zinc-300 hover:font-bold duration-300">Näytä vähemmän</button>

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
                <h2 className="font-bold text-4xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {betterFormatDate(selectedMenu.date)}
                </h2>
                {selectedMenu.mealoptions.map((mealOption, index) => (
                  <motion.div 
                    key={index} 
                    className="mt-8 p-6 rounded-2xl bg-[#1a1a1a]/50 backdrop-blur-sm border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3 className="text-2xl font-bold text-blue-400">{mealOption.name}</h3>
                    <ul className="space-y-4 mt-4">
                      {mealOption.menuItems.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-zinc-300 flex items-center justify-between p-4 rounded-xl bg-[#252525]/50 hover:bg-[#303030]/50 transition-colors duration-300"
                        >
                          <span className="font-medium">
                            {item.name} <span className="text-zinc-500">- {item.portionSize}g</span>
                          </span>
                          <button
                            className="p-2 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all duration-300"
                            onClick={() => setPopupItem(item)}
                          >
                            <CookingPot size={20} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
                <p className="text-center font-medium text-zinc-500 mt-10">made with ♥ by aapelix</p>
                <div className="flex justify-center gap-2"><a href="https://github.com/aapelix/jamixmenuv3" target="blank" className="text-center hover:underline font-medium text-zinc-500 mb-10">Source code</a><a href="https://buymeacoffee.com/aapelix" target="blank" className="text-center hover:underline font-medium text-zinc-500 mb-10">Support</a></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {popupItem && (
            <IngredientPopup item={popupItem} onClose={() => setPopupItem(null)} />
          )}
        </AnimatePresence>
        
      </div>
    </motion.main>
  );
}
