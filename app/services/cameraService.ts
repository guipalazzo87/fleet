import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

class CameraService {
  private static instance: CameraService;
  private imagesDirectory: string;

  private constructor() {
    this.imagesDirectory = `${FileSystem.documentDirectory}images/`;
    this.ensureDirectoryExists();
  }

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  async requestCameraPermission(): Promise<void> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission denied');
    }
  }

  async launchCamera(): Promise<string[]> {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (result.canceled) {
      return [];
    }

    const localPath = await this.processImage(result.assets[0].uri);
    return [localPath];
  }

  async launchCameraMultiple(): Promise<string[]> {
    const results: string[] = [];
    let keepTaking = true;

    while (keepTaking) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (result.canceled) {
        keepTaking = false;
        continue;
      }

      const localPath = await this.processImage(result.assets[0].uri);
      results.push(localPath);

      keepTaking = await new Promise(resolve => {
        Alert.alert(
          'Add another picture?',
          'Would you like to take another picture?',
          [
            { text: 'No', onPress: () => resolve(false) },
            { text: 'Yes', onPress: () => resolve(true) },
          ],
          { cancelable: false }
        );
      });
    }

    return results;
  }

  async deleteImage(path: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.imagesDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.imagesDirectory, { intermediates: true });
    }
  }

  private async saveImage(uri: string): Promise<string> {
    const filename = `${Date.now()}.jpg`;
    const destination = `${this.imagesDirectory}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  }

  private async processImage(uri: string): Promise<string> {
    const processed = await manipulateAsync(uri, [{ resize: { width: 100, height: 100 } }], {
      compress: 0.5,
      format: SaveFormat.JPEG,
    });
    return await this.saveImage(processed.uri);
  }
}

export const cameraService = CameraService.getInstance();
export default cameraService;
