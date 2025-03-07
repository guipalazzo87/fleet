import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { onValue, ref, update } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Button } from '@rneui/themed';

interface Client {
  id: string;
  name: string;
}

interface SelectClientProps {
  motorcycleId: string | null;
  onReturnHome: () => void;
}

export default function SelectClient({ motorcycleId, onReturnHome }: SelectClientProps) {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const clientsRef = ref(database, 'clients');
    const unsubscribe = onValue(clientsRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const clientList: Client[] = Object.entries(data).map(([id, client]) => ({ ...(client as Client), id }));
        setClients(clientList);
      } else {
        setClients([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelect = (client: Client) => {
    if (motorcycleId) {
      const motorcycleRef = ref(database, `motorcycles/${motorcycleId}`);
      update(motorcycleRef, { client: client.name, isAvailable: false })
        .then(onReturnHome)
        .catch(error => console.error('Error updating motorcycle: ', error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selecione um cliente</Text>
      <FlatList
        data={clients}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
      <Button title="Voltar" onPress={onReturnHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000',
    fontSize: 20,
    marginBottom: 20,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
