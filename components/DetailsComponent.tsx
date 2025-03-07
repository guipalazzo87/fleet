import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome as FAIcon } from '@expo/vector-icons';
import { Text } from './Themed';

interface DetailsComponentProps<T> {
  item: T;
  onEdit: () => void;
  onDelete: () => void;
  onImagePress: (imageUri: string) => void;
}

export default function DetailsComponent<
  T extends {
    pictures?: string[];
    documentPictures?: string[];
    name: string;
    brand?: string;
    year?: number;
    type?: string;
    color?: string;
    odometer?: number;
  },
>({ item, onEdit, onDelete, onImagePress }: DetailsComponentProps<T>) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (item.pictures?.length ? onImagePress(item.pictures[0]) : null)}
          style={styles.imageContainer}
        >
          {item.pictures?.length && item.pictures?.length > 0 ? (
            <Image source={{ uri: item.pictures[0] }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderContainer]}>
              <FAIcon name="image" size={60} color="#ccc" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <FAIcon name="trash" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <FAIcon name="pencil" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        {Object.keys(item).map(key => {
          if (key === 'pictures' || key === 'documentPictures' || key === 'name') {
            return null;
          }
          return (
            <View key={key}>
              <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Text style={styles.value}>{(item as any)[key]}</Text>
            </View>
          );
        })}
        <View style={styles.documentImagesContainer}>
          {item.documentPictures?.length && item.documentPictures.length > 0 ? (
            item.documentPictures.map((picture, index) => (
              <TouchableOpacity key={index} onPress={() => onImagePress(picture)} style={styles.documentImageWrapper}>
                <Image source={{ uri: picture }} style={styles.documentImage} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.documentImage, styles.placeholderContainer]}>
              <FAIcon name="id-card" size={60} color="#ccc" />
            </View>
          )}
        </View>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
