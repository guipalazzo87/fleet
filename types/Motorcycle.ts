import { ListItemBase } from '@/types/ListItemBase';

export interface Motorcycle extends ListItemBase {
  id: string;
  name: string;
  brand: string;
  year: number;
  type: string;
  color: string;
  odometer: number;
  pictures: string[];
  documentPictures: string[];
  client?: string;
  isAvailable: boolean;
}
