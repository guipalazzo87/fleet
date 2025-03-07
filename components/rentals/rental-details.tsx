import React, { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { onValue, ref, update } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Motorcycle } from '@/types/Motorcycle';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

interface RentalDetailsProps {
  rentalId: string | null;
  onReturnHome: () => void;
}

interface Client {
  id: string;
  name: string;
  picture: string;
}

export default function RentalDetails({ rentalId, onReturnHome }: RentalDetailsProps) {
  const [rental, setRental] = useState<Motorcycle | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (rentalId) {
      const rentalRef = ref(database, `motorcycles/${rentalId}`);
      const unsubscribe = onValue(rentalRef, snapshot => {
        if (snapshot.exists()) {
          const rentalData = snapshot.val() as Motorcycle;
          setRental({ ...rentalData, id: snapshot.key! });
        } else {
          setRental(null);
        }
      });

      return () => unsubscribe();
    }
  }, [rentalId]);

  useEffect(() => {
    if (rental && rental.client) {
      const clientRef = ref(database, `clients/${rental.client}`);
      const unsubscribe = onValue(clientRef, snapshot => {
        if (snapshot.exists()) {
          setClient(snapshot.val() as Client);
        } else {
          setClient(null);
        }
      });

      return () => unsubscribe();
    }
  }, [rental]);

  const handleReturn = () => {
    if (rentalId) {
      const rentalRef = ref(database, `motorcycles/${rentalId}`);
      update(rentalRef, { client: null, isAvailable: true })
        .then(onReturnHome)
        .catch(error => console.error('Error updating rental: ', error));
    }
  };

  const navigateToMotorcycleDetails = (motorcycleId: string) => {
    router.push({
      pathname: '/(tabs)/motorcycles/[id]',
      params: { id: motorcycleId },
    });
  };

  const navigateToClientDetails = (clientId: string) => {
    router.push({
      pathname: '/(tabs)/clients/[id]',
      params: { id: clientId },
    });
  };

  if (!rental) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detalhes da locação</Text>
      <TouchableOpacity onPress={() => navigateToMotorcycleDetails(rental.id)}>
        <Image source={{ uri: rental.pictures[0] }} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.detailsContainer}>
        <Text style={styles.detail}>Motocicleta: {rental.name}</Text>
        <Text style={styles.detail}>Cliente: {rental.client}</Text>
      </View>
      {client && (
        <TouchableOpacity onPress={() => navigateToClientDetails(client.id)}>
          <Image source={{ uri: client.picture }} style={styles.image} />
        </TouchableOpacity>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Marcar como devolvida" onPress={handleReturn} />
        <Button title="Voltar" onPress={onReturnHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#000',
    fontSize: 20,
    marginTop: 20,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detail: {
    color: '#000',
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 20,
    paddingHorizontal: 20,
  },
});
