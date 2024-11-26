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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#0a0a0a] p-6 rounded shadow-lg lg:w-1/2 w-full mx-5 max-w-lg">
        <h2 className="text-xl font-bold mb-4">{item.name}</h2>
        <div
          className="text-zinc-400"
          dangerouslySetInnerHTML={{ __html: item.ingredients }}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          Sulje
        </button>
      </div>
    </div>
  );
};

export default function Id() {
  const { id, customerid } = useParams();

  const [kitchenData, setKitchenData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupItem, setPopupItem] = useState(null);
  const [slideDirection, setSlideDirection] = useState("right");

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
    <main className="w-full h-full flex justify-center mb-10">
      <div className="lg:w-2/4 w-full mt-24 mx-10">
        <a className="text-zinc-300 mb-5" href="/">
          Palaa alkuun
        </a>
        {kitchen && (
          <>
            <h1 className="font-black text-5xl">{kitchen.kitchenName}</h1>
            <p className="mt-2 text-zinc-300 w-2/3">{kitchen.info}</p>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {menuDays.map((day) => (
            <button
              key={day.date}
              onClick={() => handleDateChange(day.date)}
              className={`px-4 py-2 rounded-xl ${
                selectedDate === day.date.toString()
                  ? "bg-blue-500 text-white"
                  : "bg-[#1a1a1a]"
              }`}
            >
              {betterFormatDate(day.date)}
            </button>
          ))}
        </div>

        <div className="relative mt-6">
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
                <h2 className="font-semibold text-3xl">
                  {betterFormatDate(selectedMenu.date)}
                </h2>
                {selectedMenu.mealoptions.map((mealOption, index) => (
                  <div key={index} className="mt-4">
                    <h3 className="text-2xl font-semibold">{mealOption.name}</h3>
                    <ul>
                      {mealOption.menuItems.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="mt-2 text-zinc-300 flex items-center"
                        >
                          <span className="mr-2">
                            {item.name} - {item.portionSize}g
                          </span>
                          <button
                            className="px-2 py-1 bg-blue-500 bg-opacity-30 hover:bg-opacity-100 duration-300 text-white rounded"
                            onClick={() => setPopupItem(item)}
                          >
                            <CookingPot />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <h1 className="text-center font-bold mt-10 mb-10">made by aapelix</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {popupItem && (
          <IngredientPopup item={popupItem} onClose={() => setPopupItem(null)} />
        )}
        
      </div>
    </main>
  );
}
