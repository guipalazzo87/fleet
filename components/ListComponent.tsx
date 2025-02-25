import { FlatList, Image, Modal, TouchableOpacity, View } from 'react-native';
import { ListItemBase } from '@/types/ListItemBase';
import { Text } from './Themed';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '@rneui/themed';
import React from 'react';

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

  const defaultRender = (item: T, isSelected: boolean) => (
    <View style={[styles.item, isSelected && styles.selectedItem]}>
      {item.picture && <Image source={{ uri: `data:image/jpeg;base64,${item.picture}` }} style={styles.image} />}
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
    return <Text style={styles.message}>No items found</Text>;
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
        containerStyle={styles.fab}
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
            <Text>Are you sure you want to delete the selected items?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancel" type="outline" onPress={() => setModalVisible(false)} />
              <Button title="Delete" onPress={handleDelete} buttonStyle={{ backgroundColor: 'red' }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
