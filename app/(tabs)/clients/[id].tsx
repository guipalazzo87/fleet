import { database } from '@/config/firebaseConfig';
import { get, ref, remove } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Button,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
        const clientData = snapshot.val();
        setClient({
          id,
          ...clientData,
          picture: clientData.picture,
          documentPictures: clientData.documentPictures,
        });
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

  const handleDial = async (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    await Linking.openURL(phoneUrl);
  };

  const handleWhatsApp = async (phone: string) => {
    const whatsappUrl = `whatsapp://send?phone=${phone.replace(/\D/g, '')}`;
    await Linking.openURL(whatsappUrl);
  };

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
        <TouchableOpacity
          onPress={() => (client.picture ? openModal(client.picture) : null)}
          style={styles.imageContainer}
        >
          {client.picture ? (
            <Image source={{ uri: client.picture }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderContainer]}>
              <FAIcon name="user-circle" size={60} color="#ccc" />
            </View>
          )}
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
        <View style={styles.phoneContainer}>
          <Text style={styles.value}>{client.phone}</Text>
          <View style={styles.phoneButtons}>
            <TouchableOpacity onPress={() => handleDial(client.phone)} style={styles.phoneButton}>
              <FAIcon name="phone" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleWhatsApp(client.phone)} style={styles.phoneButton}>
              <FAIcon name="whatsapp" size={24} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{client.address}</Text>
        <View style={styles.documentImagesContainer}>
          {client.documentPictures ? (
            client.documentPictures.map((picture, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(picture)} style={styles.documentImageWrapper}>
                <Image source={{ uri: picture }} style={styles.documentImage} />
              </TouchableOpacity>
            ))
          ) : (
            <>
              <View style={[styles.documentImage, styles.placeholderContainer]}>
                <FAIcon name="id-card" size={60} color="#ccc" />
              </View>
            </>
          )}
        </View>
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  phoneButtons: {
    flexDirection: 'row',
  },
  phoneButton: {
    marginLeft: 16,
    padding: 8,
  },
  imageContainer: {
    borderRadius: 60,
    overflow: 'hidden',
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  documentImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  documentImageWrapper: {
    width: '48%',
    aspectRatio: 1,
  },
  documentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
