import React from 'react';
import { Href, router, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/components/useColorScheme';
import { Pressable } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
);

const AboutIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24} />
);

const ClientsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={24} />
);

// TODO: Fix the path for the HomeTabButton
const HomeTabButton = (props: BottomTabBarButtonProps) => <TabBarButton {...props} path="/(tabs)/clients" />;

const AboutTabButton = (props: BottomTabBarButtonProps) => <TabBarButton {...props} path="/(tabs)/about" />;

const ClientsTabButton = (props: BottomTabBarButtonProps) => <TabBarButton {...props} path="/(tabs)/clients/" />;

const TabBarButton = ({ path, ...props }: BottomTabBarButtonProps & { path: Href }) => (
  <Pressable {...props} onPress={() => router.navigate(path)} />
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
      screenListeners={{
        tabPress: e => {
          if (e.target?.toString().includes('clients')) {
            e.preventDefault();
            router.replace('/(tabs)/clients/');
          }
        },
      }}
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
        name="about"
        options={{
          title: 'About',
          tabBarIcon: AboutIcon,
          tabBarButton: AboutTabButton,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ClientsIcon,
          tabBarButton: ClientsTabButton,
        }}
      />
    </Tabs>
  );
}
