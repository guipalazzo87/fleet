import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

class CameraService {
  private static instance: CameraService;

  private constructor() {}

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
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return [];
    }

    const manipulatedImage = await manipulateAsync(result.assets[0].uri, [], {
      format: SaveFormat.JPEG,
      base64: true,
    });

    return manipulatedImage.base64 ? [manipulatedImage.base64] : [];
  }
}

export const cameraService = CameraService.getInstance();
export default cameraService;
