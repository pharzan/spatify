export interface SpatiLocationRecord {
  id: string;
  store_name: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  opening_hours: string;
  store_type: string;
  rating: number;
}

export const staticSpatiRecords: SpatiLocationRecord[] = [
  {
    id: '1',
    store_name: 'Späti Berlin Mitte',
    description: '24/7 Corner Shop',
    lat: 52.52,
    lng: 13.405,
    address: 'Torstraße 123, 10119 Berlin',
    opening_hours: '24/7',
    store_type: 'späti',
    rating: 4.5,
  },
  {
    id: '2',
    store_name: 'Nachtladen Kreuzberg',
    description: 'Late night essentials',
    lat: 52.4995,
    lng: 13.4189,
    address: 'Oranienstraße 45, 10969 Berlin',
    opening_hours: '22:00 - 06:00',
    store_type: 'späti',
    rating: 4.2,
  },
  {
    id: '3',
    store_name: 'Corner Store Prenzlauer Berg',
    description: 'Drinks and snacks',
    lat: 52.539,
    lng: 13.4129,
    address: 'Schönhauser Allee 89, 10439 Berlin',
    opening_hours: '20:00 - 04:00',
    store_type: 'späti',
    rating: 4.7,
  },
];
