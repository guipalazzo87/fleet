import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { onValue, ref } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Motorcycle } from '@/types/Motorcycle';
import { Button } from '@rneui/themed';

interface SelectMotorcycleProps {
  onSelect: (motorcycleId: string) => void;
  onReturnHome: () => void;
}

export default function SelectMotorcycle({ onSelect, onReturnHome }: SelectMotorcycleProps) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);

  useEffect(() => {
    const motorcyclesRef = ref(database, 'motorcycles');
    const unsubscribe = onValue(motorcyclesRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const availableMotorcycles: Motorcycle[] = Object.entries(data)
          .map(([id, motorcycle]) => ({ ...(motorcycle as Motorcycle), id }))
          .filter(motorcycle => motorcycle.isAvailable);
        setMotorcycles(availableMotorcycles);
      } else {
        setMotorcycles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Motocicletas disponíveis</Text>
      <FlatList
        data={motorcycles}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item.id)} style={styles.item}>
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
