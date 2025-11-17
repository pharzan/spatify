export type Location = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  hours: string;
  type: string;
  rating: number;
};

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Späti Berlin Mitte',
    description: '24/7 Corner Shop',
    latitude: 52.5200,
    longitude: 13.4050,
    address: 'Torstraße 123, 10119 Berlin',
    hours: '24/7',
    type: 'späti',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Nachtladen Kreuzberg',
    description: 'Late night essentials',
    latitude: 52.4995,
    longitude: 13.4189,
    address: 'Oranienstraße 45, 10969 Berlin',
    hours: '22:00 - 06:00',
    type: 'späti',
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Corner Store Prenzlauer Berg',
    description: 'Drinks and snacks',
    latitude: 52.5390,
    longitude: 13.4129,
    address: 'Schönhauser Allee 89, 10439 Berlin',
    hours: '20:00 - 04:00',
    type: 'späti',
    rating: 4.7,
  },
];
