import { ListItemBase } from '@/types/ListItemBase';

export interface Client extends ListItemBase {
  id: string;
  name: string;
  title: string;
  address: string;
  phone: string;
  picture: string;
  documentPictures: string[];
  route: string;
}
