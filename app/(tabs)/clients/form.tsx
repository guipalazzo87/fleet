import React, { useEffect } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

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
  documentPicture?: string;
};

export default function ClientFormScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ client: string }>();
  const client = params.client ? (JSON.parse(params.client) as Client) : undefined;

  useEffect(() => {
    cameraService.requestCameraPermission().catch((error: Error) => console.log(error.message));
  }, []);

  const handleCameraLaunch = async (setFieldValue: (field: string, value: string) => void, field: string) => {
    try {
      const pictures = await cameraService.launchCamera();
      if (pictures.length > 0) {
        setFieldValue(field, pictures[0]);
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
    console.log('Submitting form with values: ', values);
    const reference = client ? ref(database, `/clients/${client.id}`) : ref(database, `/clients/${Date.now()}`);
    const clientData = {
      name: values.name,
      address: values.address,
      phone: values.phone,
      picture: values.picture,
      documentPicture: values.documentPicture,
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

  return (
    <Formik
      initialValues={{
        name: client?.name || '',
        address: client?.address || '',
        phone: client?.phone || '',
        picture: client?.picture || '',
        documentPicture: client?.documentPicture || '',
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

          <Button title="Take Picture" onPress={() => handleCameraLaunch(setFieldValue, 'picture')} />
          {values.picture ? (
            <Image source={{ uri: `data:image/jpeg;base64,${values.picture}` }} style={{ width: 100, height: 100 }} />
          ) : null}

          <Button title="Add ID Picture" onPress={() => handleCameraLaunch(setFieldValue, 'documentPicture')} />
          {values.documentPicture ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${values.documentPicture}`,
              }}
              style={{ width: 100, height: 100 }}
            />
          ) : null}

          <Button title={client ? 'Update' : 'Submit'} onPress={() => handleSubmit()} />
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
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
