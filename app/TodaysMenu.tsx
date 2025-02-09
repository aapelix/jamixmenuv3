"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";

const fetchKitchenMenu = async (
  customerId: string,
  kitchenId: string
): Promise<any[] | null> => {
  try {
    const res = await fetch(
      `https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/${customerId}/${kitchenId}?lang=fi`
    );
    if (!res.ok) {
      console.error('Failed to fetch kitchen menu');
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching kitchen menu:', error);
    return null;
  }
};

const CompactTodaysMenu = ({
  customerId,
  kitchenId
}: {
  customerId: string,
  kitchenId: string
}) => {
  const [menuSummary, setMenuSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTodaysDateString = () => {
    const today = new Date();
    return today.toISOString().replace(/\D/g, '').slice(0, 8);
  };

  const fetchTodaysMenuSummary = async () => {
    try {
      setIsLoading(true);
      const menuData = await fetchKitchenMenu(customerId, kitchenId);
      if (menuData && menuData.length > 0) {
        const todaysDateString = getTodaysDateString();
        const todayMenu = menuData[0]?.menuTypes[0]?.menus[0]?.days?.find(
          (day: any) => day.date.toString() === todaysDateString
        );
        if (todayMenu && todayMenu.mealoptions.length > 0) {
          const menuItems = todayMenu.mealoptions[0].menuItems;
          const firstItem = menuItems[0]?.name || '';
          const secondItem = menuItems[1]?.name || '';
          const combinedSummary = secondItem
            ? `${firstItem} & ${secondItem}`
            : firstItem;
          setMenuSummary(combinedSummary);
        } else {
          setMenuSummary('Ei ruokaa');
        }
      } else {
        setMenuSummary('Virhe');
      }
    } catch (err) {
      setMenuSummary('Virhe');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysMenuSummary();
  }, [customerId, kitchenId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 rounded-lg backdrop-blur-sm bg-primary/5 border border-primary/10 hover:border-primary/20 transition-all duration-300"
      title={menuSummary || 'Ei ruokalistaa'}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Utensils className="w-4 h-4 text-primary" />
        </div>
        
        {isLoading ? (
          <motion.div 
            className="h-5 w-40 rounded bg-primary/10 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="font-medium text-foreground">Tänään ruokana:</span>{' '}
            {menuSummary || 'Ei ruokalistaa'}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default CompactTodaysMenu;