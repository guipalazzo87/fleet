import React, { useEffect } from 'react';
import {
  BackHandler,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesome as FAIcon } from '@expo/vector-icons';
import { database } from '@/config/firebaseConfig';
import { ref, set, update } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { Motorcycle } from '@/types/Motorcycle';
import { cameraService } from '@/app/services/cameraService';

type FormValues = {
  name: string;
  brand: string;
  year: number;
  type: string;
  color: string;
  odometer: number;
  pictures: string[];
  documentPictures: string[];
};

export default function MotorcycleFormScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ motorcycle: string }>();
  const motorcycle = params.motorcycle ? (JSON.parse(params.motorcycle) as Motorcycle) : undefined;

  useEffect(() => {
    if (!motorcycle) {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push({
        pathname: '/(tabs)/motorcycles/[id]',
        params: { id: motorcycle.id },
      });
      return true;
    });
    return () => backHandler.remove();
  }, [motorcycle]);

  useEffect(() => {
    cameraService.requestCameraPermission().catch((error: Error) => console.log(error.message));
  }, []);

  const handleCameraLaunch = async (
    setFieldValue: (field: string, value: string | string[]) => void,
    values: FormValues,
    field: 'pictures' | 'documentPictures',
    multiple: boolean = false
  ) => {
    try {
      const pictures = multiple ? await cameraService.launchCameraMultiple() : await cameraService.launchCamera();

      if (pictures.length > 0) {
        if (multiple) {
          const currentPictures = values[field] || [];
          setFieldValue(field, [...currentPictures, ...pictures]);
        } else {
          setFieldValue(field, pictures[0]);
        }
      }
    } catch (error) {
      console.error('Error launching camera: ', error);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('form.validation.required', { field: t('form.labels.name') })),
    brand: Yup.string().required(t('form.validation.required', { field: t('form.labels.brand') })),
    year: Yup.number().required(t('form.validation.required', { field: t('form.labels.year') })),
    type: Yup.string().required(t('form.validation.required', { field: t('form.labels.type') })),
    color: Yup.string().required(t('form.validation.required', { field: t('form.labels.color') })),
    odometer: Yup.number().required(t('form.validation.required', { field: t('form.labels.odometer') })),
  });

  const handleOnSubmit = async (values: FormValues) => {
    const reference = motorcycle
      ? ref(database, `/motorcycles/${motorcycle.id}`)
      : ref(database, `/motorcycles/${Date.now()}`);
    const motorcycleData = {
      name: values.name,
      brand: values.brand,
      year: values.year,
      type: values.type,
      color: values.color,
      odometer: values.odometer,
      pictures: values.pictures,
      documentPictures: values.documentPictures,
    };

    try {
      if (motorcycle) {
        await update(reference, motorcycleData);
      } else {
        await set(reference, motorcycleData);
      }
      router.replace('/(tabs)/motorcycles');
    } catch (error) {
      console.error('Error saving motorcycle data: ', error);
    }
  };

  const handleRemovePicture = (
    setFieldValue: (field: string, value: string | string[]) => void,
    values: FormValues,
    field: 'pictures' | 'documentPictures',
    index?: number
  ) => {
    if (index !== undefined) {
      const newPictures = values[field].filter((_, i) => i !== index);
      setFieldValue(field, newPictures);
    }
  };

  return (
    <Formik
      initialValues={{
        name: motorcycle?.name || '',
        brand: motorcycle?.brand || '',
        year: motorcycle?.year || 0,
        type: motorcycle?.type || '',
        color: motorcycle?.color || '',
        odometer: motorcycle?.odometer || 0,
        pictures: motorcycle?.pictures || [],
        documentPictures: motorcycle?.documentPictures || [],
      }}
      validationSchema={validationSchema}
      onSubmit={(values: FormValues) => handleOnSubmit(values)}
    >
      {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('name')}
            onBlur={handleBlur('name')}
            value={values.name}
          />
          {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('brand')}
            onBlur={handleBlur('brand')}
            value={values.brand}
          />
          {touched.brand && errors.brand && <Text style={styles.error}>{errors.brand}</Text>}
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('year')}
            onBlur={handleBlur('year')}
            value={String(values.year)}
            keyboardType="numeric"
          />
          {touched.year && errors.year && <Text style={styles.error}>{errors.year}</Text>}
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('type')}
            onBlur={handleBlur('type')}
            value={values.type}
          />
          {touched.type && errors.type && <Text style={styles.error}>{errors.type}</Text>}
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('color')}
            onBlur={handleBlur('color')}
            value={values.color}
          />
          {touched.color && errors.color && <Text style={styles.error}>{errors.color}</Text>}
          <Text style={styles.label}>Odometer</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('odometer')}
            onBlur={handleBlur('odometer')}
            value={String(values.odometer)}
            keyboardType="numeric"
          />
          {touched.odometer && errors.odometer && <Text style={styles.error}>{errors.odometer}</Text>}
          <Button title="Capturar imagem" onPress={() => handleCameraLaunch(setFieldValue, values, 'pictures', true)} />
          <View style={styles.imageGrid}>
            {values.pictures?.map((path, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: path }} style={styles.documentPreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    cameraService.deleteImage(path);
                    handleRemovePicture(setFieldValue, values, 'pictures', index);
                  }}
                >
                  <FAIcon name="times-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Button
            title="Adicionar foto do documento"
            onPress={() => handleCameraLaunch(setFieldValue, values, 'documentPictures', true)}
          />
          <View style={styles.imageGrid}>
            {values.documentPictures?.map((path, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: path }} style={styles.documentPreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    cameraService.deleteImage(path);
                    handleRemovePicture(setFieldValue, values, 'documentPictures', index);
                  }}
                >
                  <FAIcon name="times-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Button title={motorcycle ? 'Atualizar' : 'Enviar'} onPress={() => handleSubmit()} />
        </ScrollView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  documentPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  removeButton: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
});
