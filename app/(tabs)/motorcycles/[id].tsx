import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Button, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { onValue, ref, remove } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import DetailsComponent from '@/components/DetailsComponent';
import { Motorcycle } from '@/types/Motorcycle';

export default function MotorcycleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const motorcycleRef = ref(database, `motorcycles/${id}`);
    onValue(motorcycleRef, snapshot => {
      if (snapshot.exists()) {
        setMotorcycle(snapshot.val());
      }
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(tabs)/motorcycles');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router])
  );

  const openModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/motorcycles/form',
      params: { motorcycle: JSON.stringify(motorcycle) },
    });
  };

  const handleDelete = () => {
    if (!motorcycle) {
      return;
    }
    const motorcycleRef = ref(database, `motorcycles/${motorcycle.id}`);
    remove(motorcycleRef)
      .then(() => {
        setDeleteModalVisible(false);
        router.replace('/(tabs)/motorcycles');
      })
      .catch((error: Error) => {
        console.error('Error deleting motorcycle: ', error);
      });
  };

  if (!motorcycle) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DetailsComponent
        item={motorcycle}
        onEdit={handleEdit}
        onDelete={() => setDeleteModalVisible(true)}
        onImagePress={openModal}
      />

      <Modal visible={modalVisible} transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={closeModal}>
            <View style={styles.modalContent}>
              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.enlargedImage} resizeMode="contain" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Are you sure you want to delete this motorcycle?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setDeleteModalVisible(false)} />
              <Button title="Delete" onPress={handleDelete} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
    aspectRatio: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
