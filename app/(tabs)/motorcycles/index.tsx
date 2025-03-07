import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { onValue, ref, remove } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import ListComponent from '@/components/ListComponent';
import { Motorcycle } from '@/types/Motorcycle';
import { BackHandler, Button, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useGridView } from '@/context/GridViewContext/GridViewContext';
import { Button as RNUIButton } from '@rneui/themed';

interface FirebaseMotorcycleData {
  name: string;
  brand: string;
  year: number;
  type: string;
  color: string;
  odometer: number;
  pictures: string[];
  documentPictures: string[];
}

const transformMotorcycleData = (id: string, motorcycleData: FirebaseMotorcycleData): Motorcycle => ({
  route: `/(tabs)/motorcycles/${id}`,
  title: motorcycleData.name,
  id,
  name: motorcycleData.name,
  brand: motorcycleData.brand,
  year: motorcycleData.year,
  type: motorcycleData.type,
  color: motorcycleData.color,
  odometer: motorcycleData.odometer,
  pictures: motorcycleData.pictures,
  documentPictures: motorcycleData.documentPictures,
  isAvailable: true,
});

export default function MotorcyclesScreen() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMotorcycles, setSelectedMotorcycles] = useState<Motorcycle[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  const { isGridView } = useGridView();

  useEffect(() => {
    const motorcyclesRef = ref(database, 'motorcycles');
    const unsubscribe = onValue(motorcyclesRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const motorcycleList: Motorcycle[] = Object.entries(data).map(([id, motorcycle]) =>
          transformMotorcycleData(id, motorcycle as FirebaseMotorcycleData)
        );
        setMotorcycles(motorcycleList);
      } else {
        setMotorcycles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (selectMode) {
        setSelectedMotorcycles([]);
        setSelectMode(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [selectMode]);

  const handlePress = (motorcycle: Motorcycle) => {
    if (selectMode) {
      if (selectedMotorcycles.includes(motorcycle)) {
        const updatedSelection = selectedMotorcycles.filter(m => m.id !== motorcycle.id);
        setSelectedMotorcycles(updatedSelection);
        if (updatedSelection.length === 0) {
          setSelectMode(false);
        }
      } else {
        setSelectedMotorcycles([...selectedMotorcycles, motorcycle]);
      }
    } else {
      router.replace({
        pathname: '/(tabs)/motorcycles/[id]',
        params: { id: motorcycle.id },
      });
    }
  };

  const handleLongPress = (motorcycle: Motorcycle) => {
    setSelectMode(true);
    if (!selectedMotorcycles.includes(motorcycle)) {
      setSelectedMotorcycles([...selectedMotorcycles, motorcycle]);
    }
  };

  const handleDelete = () => {
    selectedMotorcycles.forEach(motorcycle => {
      const motorcycleRef = ref(database, `motorcycles/${motorcycle.id}`);
      remove(motorcycleRef)
        .then(() => console.log('Motorcycle deleted successfully'))
        .catch(error => console.error('Error deleting motorcycle: ', error));
    });
    setSelectedMotorcycles([]);
    setSelectMode(false);
  };

  const handleSelectAll = () => {
    if (selectedMotorcycles.length === motorcycles.length) {
      setSelectedMotorcycles([]);
    } else {
      setSelectedMotorcycles(motorcycles);
    }
  };

  const renderGridItem = ({ item }: { item: Motorcycle }) => {
    const isSelected = selectedMotorcycles.includes(item);
    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        style={[styles.gridItem, isSelected && styles.selectedGridItem]}
      >
        {item.pictures?.length > 0 && <Image source={{ uri: item.pictures[0] }} style={styles.gridImage} />}
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.brand}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {selectMode && (
        <View style={styles.topBar}>
          <Button title="Selecionar tudo" onPress={handleSelectAll} />
          <Button title="Remover selecionados" onPress={handleDelete} />
        </View>
      )}
      {isGridView ? (
        <View style={styles.gridContainer}>
          <FlatList
            data={motorcycles}
            renderItem={renderGridItem}
            keyExtractor={item => item.id}
            numColumns={2}
            key={'GRID'}
          />
          <RNUIButton
            raised
            buttonStyle={styles.fabButton}
            onPress={() => router.push('/(tabs)/motorcycles/form')}
            icon={{
              name: 'add',
              type: 'material',
              size: 24,
              color: 'white',
            }}
          />
        </View>
      ) : (
        <ListComponent
          items={motorcycles}
          loading={loading}
          selectMode={selectMode}
          selectedItems={selectedMotorcycles}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onAdd={() => router.push('/(tabs)/motorcycles/form')}
          onDelete={handleDelete}
          onClearSelection={() => {
            setSelectedMotorcycles([]);
            setSelectMode(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gridItem: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedGridItem: {
    backgroundColor: '#d3d3d3',
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
  },
  gridImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
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
});
