import { Stack } from 'expo-router';

export default function ClientsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, headerTitle: 'Clients' }} />
      <Stack.Screen name="form" options={{ headerShown: false, headerTitle: 'Client Form' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false, headerTitle: 'Client Details' }} />
    </Stack>
  );
}
