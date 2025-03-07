import { Stack } from 'expo-router';

export default function MotorcyclesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, headerTitle: 'Motorcycles' }} />
      <Stack.Screen name="form" options={{ headerShown: false, headerTitle: 'Motorcycle Form' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false, headerTitle: 'Motorcycle Details' }} />
    </Stack>
  );
}
