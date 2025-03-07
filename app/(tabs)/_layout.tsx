import React from 'react';
import { Href, router, Tabs } from 'expo-router';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { Pressable, TouchableOpacity } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { GridViewProvider, useGridView } from '@/context/GridViewContext/GridViewContext';

const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
);

const MotorcycleIcon = ({ color }: { color: string; focused: boolean }) => (
  <Fontisto name="motorcycle" size={24} color={color} />
);

const ClientsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={24} />
);

const HomeTabButton = (props: BottomTabBarButtonProps) => <TabBarButton {...props} path="/(tabs)" />;

const MotorcycleTabButton = (props: BottomTabBarButtonProps) => <TabBarButton {...props} path="/(tabs)/motorcycles" />;

const ClientsTabButton = (props: BottomTabBarButtonProps) => <TabBarButton {...props} path="/(tabs)/clients/" />;

const TabBarButton = ({ path, ...props }: BottomTabBarButtonProps & { path: Href }) => (
  <Pressable {...props} onPress={() => router.navigate(path)} />
);

const HeaderRightButton: React.FC = () => {
  const { isGridView, setIsGridView } = useGridView();

  return (
    <TouchableOpacity onPress={() => setIsGridView(!isGridView)} style={{ padding: 10 }}>
      <Icon name={isGridView ? 'list' : 'grid'} size={24} color="#000" />
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GridViewProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colorScheme === 'dark' ? '#ffd33d' : '#007AFF',
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#25292e' : '#ffffff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#47505a' : '#ffffff',
          },
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: HomeIcon,
            tabBarButton: HomeTabButton,
          }}
        />
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clientes',
            tabBarIcon: ClientsIcon,
            tabBarButton: ClientsTabButton,
          }}
        />
        <Tabs.Screen
          name="motorcycles"
          options={{
            title: 'Motos',
            tabBarIcon: MotorcycleIcon,
            tabBarButton: MotorcycleTabButton,
            headerRight: () => <HeaderRightButton />,
          }}
        />
      </Tabs>
    </GridViewProvider>
  );
}
