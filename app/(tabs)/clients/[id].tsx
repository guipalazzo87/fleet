import { database } from '@/config/firebaseConfig';
import { get, ref, remove } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { BackHandler, Button, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome as FAIcon } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Client } from '@/types/Client';

export default function ClientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      const clientRef = ref(database, `clients/${id}`);
      const snapshot = await get(clientRef);
      if (snapshot.exists()) {
        setClient({ id, ...snapshot.val() });
      }
    };
    fetchClient();
  }, [id]);

  useEffect(() => {
    const backAction = () => {
      router.replace('/(tabs)/clients/');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

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
      pathname: '/(tabs)/clients/form',
      params: { client: JSON.stringify(client) },
    });
  };

  const handleDelete = () => {
    if (!client) {
      return;
    }
    const clientRef = ref(database, `clients/${client.id}`);
    remove(clientRef)
      .then(() => {
        console.log('Client deleted successfully');
        setDeleteModalVisible(false);
        router.replace('/(tabs)/clients');
      })
      .catch((error: Error) => {
        console.error('Error deleting client: ', error);
      });
  };
  if (!client) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => openModal(`data:image/jpeg;base64,${client.picture}`)}>
          <Image source={{ uri: `data:image/jpeg;base64,${client.picture}` }} style={styles.image} />
        </TouchableOpacity>
        <Text style={styles.name}>{client.name}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)} style={styles.iconButton}>
            <FAIcon name="trash" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <FAIcon name="pencil" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{client.phone}</Text>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{client.address}</Text>
        {client.documentPicture && (
          <>
            <Text style={styles.label}>Document Picture:</Text>
            <TouchableOpacity onPress={() => openModal(`data:image/jpeg;base64,${client.documentPicture}`)}>
              <Image
                source={{
                  uri: `data:image/jpeg;base64,${client.documentPicture}`,
                }}
                style={styles.documentImage}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

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
            <Text>Are you sure you want to delete this client?</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
  documentImage: {
    width: '100%',
    height: 200,
    marginTop: 16,
    borderRadius: 8,
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
