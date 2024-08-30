"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { fi } from "date-fns/locale";

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
      <div className="bg-[#0a0a0a] p-6 rounded shadow-lg w-1/2 max-w-lg">
        <h2 className="text-xl font-bold mb-4">{item.name}</h2>
        <div
          className="text-zinc-400"
          dangerouslySetInnerHTML={{ __html: item.ingredients }}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          Close
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

  const fetchKitchenData = async () => {
    const res = await fetch(
      `https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/${customerid}/${id}?lang=fi`,
    );
    const data = await res.json();
    +setKitchenData(data);

    const menuDays = data[0]?.menuTypes[0]?.menus[0]?.days || [];
    if (menuDays.length > 1) {
      // Set the default selected date to the second date
      setSelectedDate(menuDays[1].date.toString());
    }
  };

  useEffect(() => {
    fetchKitchenData();
  }, []);

  const kitchen = kitchenData[0];
  const menuDays = kitchen?.menuTypes?.[0]?.menus?.[0]?.days || [];

  const handleDateChange = (date) => {
    setSelectedDate(date.toString());
  };

  const selectedMenu = menuDays.find(
    (day) => day.date.toString() === selectedDate,
  );

  // Function to convert YYYYMMDD to Date object and format it
  const formatDate = (dateStr) => {
    if (
      typeof dateStr !== "string" ||
      dateStr.length !== 8 ||
      isNaN(Number(dateStr))
    ) {
      console.error("Invalid date format", dateStr);
      return "";
    }

    const year = parseInt(dateStr.slice(0, 4), 10);
    const month = parseInt(dateStr.slice(4, 6), 10) - 1; // Months are zero-indexed
    const day = parseInt(dateStr.slice(6, 8), 10);

    // Create a Date object
    const date = new Date(Date.UTC(year, month, day));

    // Check if the date is valid
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      console.error("Invalid date components", dateStr);
      return "";
    }

    // Return formatted date string
    return date.toLocaleDateString("fi-FI", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
    });
  };

  // Get today and yesterday's date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to start of the day
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Filter out menu days to only include from yesterday onward
  const availableDays = menuDays.filter((day) => {
    const date = new Date(
      Date.UTC(
        parseInt(day.date.toString().slice(0, 4), 10),
        parseInt(day.date.toString().slice(4, 6), 10) - 1,
        parseInt(day.date.toString().slice(6, 8), 10),
      ),
    );
    return date >= yesterday;
  });

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
          {availableDays.map((day) => (
            <button
              key={day.date}
              onClick={() => handleDateChange(day.date)}
              className={`px-4 py-2 rounded-xl ${selectedDate === day.date.toString() ? "bg-blue-500 text-white" : "bg-[#1a1a1a]"}`}
            >
              {betterFormatDate(day.date)}
            </button>
          ))}
        </div>

        {selectedMenu && (
          <div className="mt-6">
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M2 12h20" />
                          <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                          <path d="m4 8 16-4" />
                          <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Ingredient Popup */}
        {popupItem && (
          <IngredientPopup
            item={popupItem}
            onClose={() => setPopupItem(null)}
          />
        )}
        <h1 className="text-center font-bold mt-10">made by aapelix</h1>
      </div>
    </main>
  );
}
