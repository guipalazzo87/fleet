import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { onValue, ref, remove } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import ListComponent from '@/components/ListComponent';
import { Client } from '@/types/Client';

interface FirebaseClientData {
  name: string;
  phone: string;
  address?: string;
  picture?: string;
  documentPictures?: string[];
}

const transformClientData = (id: string, clientData: FirebaseClientData): Client => {
  return {
    id,
    name: clientData.name,
    title: clientData.name,
    address: clientData.address || '',
    phone: clientData.phone,
    picture: clientData.picture || '',
    documentPictures: clientData.documentPictures || [],
    route: `/(tabs)/clients/${id}`,
  };
};

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    const clientsRef = ref(database, 'clients');
    const unsubscribe = onValue(clientsRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const clientList: Client[] = Object.entries(data).map(([id, client]) =>
          transformClientData(id, client as FirebaseClientData)
        );
        setClients(clientList);
      } else {
        setClients([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePress = (client: Client) => {
    if (selectMode) {
      if (selectedClients.includes(client)) {
        setSelectedClients(selectedClients.filter(c => c.id !== client.id));
      } else {
        setSelectedClients([...selectedClients, client]);
      }
    } else {
      router.replace({
        pathname: '/(tabs)/clients/[id]',
        params: { id: client.id },
      });
    }
  };

  const handleLongPress = (client: Client) => {
    setSelectMode(true);
    if (!selectedClients.includes(client)) {
      setSelectedClients([...selectedClients, client]);
    }
  };

  const handleDelete = () => {
    selectedClients.forEach(client => {
      const clientRef = ref(database, `clients/${client.id}`);
      remove(clientRef)
        .then(() => console.log('Client deleted successfully'))
        .catch(error => console.error('Error deleting client: ', error));
    });
    setSelectedClients([]);
    setSelectMode(false);
  };

  return (
    <ListComponent
      items={clients}
      loading={loading}
      selectMode={selectMode}
      selectedItems={selectedClients}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onAdd={() => router.push('/(tabs)/clients/form')}
      onDelete={handleDelete}
      onClearSelection={() => {
        setSelectedClients([]);
        setSelectMode(false);
      }}
    />
  );
}
