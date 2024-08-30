type Kitchen = {
  kitchenName: string;
  kitchenId: number;
  address: string;
  city: string;
  email: string;
  phone: string;
  info: string;
  menuTypes: any[];
};

type Customer = {
  customerId: string;
  kitchens: Kitchen[];
};
