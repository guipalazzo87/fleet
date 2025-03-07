import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Add Image here
import { onValue, ref } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Motorcycle } from '@/types/Motorcycle';
import { Button } from '@rneui/themed';
import RentalDetails from '@/components/rentals/rental-details';
import SelectClient from '@/components/rentals/select-client';
import SelectMotorcycle from '@/components/rentals/select-motorcycle';

export default function Index() {
  const [rentals, setRentals] = useState<Motorcycle[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'selectMotorcycle' | 'selectClient' | 'rentalDetails'>(
    'home'
  );
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<string | null>(null);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);

  useEffect(() => {
    const motorcyclesRef = ref(database, 'motorcycles');
    const unsubscribe = onValue(motorcyclesRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rentalList: Motorcycle[] = Object.entries(data)
          .map(([id, motorcycle]) => ({ ...(motorcycle as Motorcycle), id }))
          .filter(motorcycle => motorcycle.client);
        setRentals(rentalList);
      } else {
        setRentals([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectMotorcycle = (motorcycleId: string) => {
    setSelectedMotorcycleId(motorcycleId);
    setCurrentPage('selectClient');
  };

  const handleSelectRental = (rentalId: string) => {
    setSelectedRentalId(rentalId);
    setCurrentPage('rentalDetails');
  };

  const handleReturnHome = () => {
    setCurrentPage('home');
    setSelectedMotorcycleId(null);
    setSelectedRentalId(null);
  };

  if (currentPage === 'selectMotorcycle') {
    return <SelectMotorcycle onSelect={handleSelectMotorcycle} onReturnHome={handleReturnHome} />;
  }

  if (currentPage === 'selectClient') {
    return <SelectClient motorcycleId={selectedMotorcycleId} onReturnHome={handleReturnHome} />;
  }

  if (currentPage === 'rentalDetails') {
    return <RentalDetails rentalId={selectedRentalId} onReturnHome={handleReturnHome} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Locações</Text>
      <FlatList
        data={rentals}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelectRental(item.id)}>
            <View style={styles.itemContent}>
              <Image source={{ uri: item.pictures[0] }} style={styles.thumbnail} />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>Cliente: {item.client}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
      <Button
        raised
        buttonStyle={styles.fabButton}
        onPress={() => setCurrentPage('selectMotorcycle')}
        icon={{
          name: 'add',
          type: 'material',
          size: 24,
          color: 'white',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  text: {
    color: '#000',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fabButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'blue',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
