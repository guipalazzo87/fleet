import { FlatList, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ListItemBase } from '@/types/ListItemBase';
import { Text } from './Themed';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '@rneui/themed';
import React, { useState } from 'react';

interface ListComponentProps<T extends ListItemBase> {
  items: T[];
  loading: boolean;
  selectMode: boolean;
  selectedItems: T[];
  onPress: (item: T) => void;
  onLongPress: (item: T) => void;
  onAdd: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
}

export default function ListComponent<T extends ListItemBase>({
  items,
  loading,
  selectMode,
  selectedItems,
  onPress,
  onLongPress,
  onAdd,
  onDelete,
  onClearSelection,
  renderItem,
}: ListComponentProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  interface WithPicture {
    picture?: string;
    pictures?: string[];
  }

  const defaultRender = (item: T & Partial<WithPicture>, isSelected: boolean) => (
    <View style={[styles.item, isSelected && styles.selectedItem]}>
      {'picture' in item && item.picture && <Image source={{ uri: item.picture }} style={styles.image} />}
      {'pictures' in item && item.pictures && <Image source={{ uri: item.pictures[0] }} style={styles.image} />}
      <View>
        <Text style={styles.title}>{item.title}</Text>
        {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
      </View>
    </View>
  );

  const handleDelete = () => {
    onDelete();
    setModalVisible(false);
  };

  if (loading) {
    return <Text style={styles.message}>Loading...</Text>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No items found</Text>
        <Button
          raised
          buttonStyle={styles.fabButton}
          onPress={onAdd}
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

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity onPress={() => onPress(item)} onLongPress={() => onLongPress(item)}>
              {renderItem ? renderItem(item, isSelected) : defaultRender(item, isSelected)}
            </TouchableOpacity>
          );
        }}
        keyExtractor={item => item.id}
      />

      <Button
        raised
        buttonStyle={styles.fabButton}
        onPress={onAdd}
        icon={{
          name: 'add',
          type: 'material',
          size: 24,
          color: 'white',
        }}
      />

      {selectMode && (
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.topBarButton}>
            <Icon name="trash" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClearSelection} style={styles.topBarButton}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Certeza que deseja deletar os items selecionados?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" type="outline" onPress={() => setModalVisible(false)} />
              <Button title="Deletar" onPress={handleDelete} buttonStyle={{ backgroundColor: 'red' }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
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
  message: {
    padding: 16,
    textAlign: 'center',
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topBarButton: {
    marginLeft: 16,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
});
