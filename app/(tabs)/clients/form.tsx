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
import { Client } from '@/types/Client';
import { cameraService } from '@/app/services/cameraService';

type FormValues = {
  name: string;
  address: string;
  phone: string;
  picture?: string;
  documentPictures: string[];
};

export default function ClientFormScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ client: string }>();
  const client = params.client ? (JSON.parse(params.client) as Client) : undefined;

  useEffect(() => {
    if (!client) {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push({
        pathname: '/(tabs)/clients/[id]',
        params: { id: client.id },
      });
      return true;
    });
    return () => backHandler.remove();
  }, [client]);

  useEffect(() => {
    cameraService.requestCameraPermission().catch((error: Error) => console.log(error.message));
  }, []);

  const handleCameraLaunch = async (
    setFieldValue: (field: string, value: string | string[]) => void,
    values: FormValues,
    field: 'picture' | 'documentPictures',
    multiple: boolean = false
  ) => {
    try {
      const pictures = multiple ? await cameraService.launchCameraMultiple() : await cameraService.launchCamera();

      if (pictures.length > 0) {
        if (multiple) {
          const currentPictures = values.documentPictures || [];
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
    address: Yup.string().required(t('form.validation.required', { field: t('form.labels.address') })),
    phone: Yup.string().required(t('form.validation.required', { field: t('form.labels.phone') })),
  });

  const handleOnSubmit = async (values: FormValues) => {
    console.log('Submitting form of user: ', values.name);
    const reference = client ? ref(database, `/clients/${client.id}`) : ref(database, `/clients/${Date.now()}`);
    const clientData = {
      name: values.name,
      address: values.address,
      phone: values.phone,
      picture: values.picture,
      documentPictures: values.documentPictures,
    };

    try {
      if (client) {
        await update(reference, clientData);
      } else {
        await set(reference, clientData);
      }
      console.log('Client data saved successfully');
      router.replace('/(tabs)/clients');
    } catch (error) {
      console.error('Error saving client data: ', error);
    }
  };

  const handleRemovePicture = (
    setFieldValue: (field: string, value: string | string[]) => void,
    values: FormValues,
    field: 'picture' | 'documentPictures',
    index?: number
  ) => {
    if (field === 'picture') {
      setFieldValue(field, '');
    } else if (index !== undefined) {
      const newPictures = values.documentPictures.filter((_, i) => i !== index);
      setFieldValue(field, newPictures);
    }
  };

  return (
    <Formik
      initialValues={{
        name: client?.name || '',
        address: client?.address || '',
        phone: client?.phone || '',
        picture: client?.picture || '',
        documentPictures: client?.documentPictures || [],
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
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('address')}
            onBlur={handleBlur('address')}
            value={values.address}
          />
          {touched.address && errors.address && <Text style={styles.error}>{errors.address}</Text>}
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('phone')}
            onBlur={handleBlur('phone')}
            value={values.phone}
          />
          {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
          <Button title="Capturar imagem" onPress={() => handleCameraLaunch(setFieldValue, values, 'picture')} />
          {values.picture && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: values.picture }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  cameraService.deleteImage(values.picture!);
                  handleRemovePicture(setFieldValue, values, 'picture');
                }}
              >
                <FAIcon name="times-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
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
          <Button title={client ? 'Atualizar' : 'Enviar'} onPress={() => handleSubmit()} />
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
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
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
