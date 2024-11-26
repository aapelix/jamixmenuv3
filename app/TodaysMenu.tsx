"use client";

import { useState, useEffect } from 'react';

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

  const getTodaysDateString = () => {
    const today = new Date();
    return today.toISOString().replace(/\D/g, '').slice(0, 8);
  };

  const fetchTodaysMenuSummary = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchTodaysMenuSummary();
  }, [customerId, kitchenId]);

  return (
    <div 
      title={menuSummary || 'Ei ruokalistaa'}
    >
      <p className="text-sm">
        Tänään ruokana: {menuSummary || 'Ei ruokalistaa'}
      </p>
    </div>
  );
};

export default CompactTodaysMenu;