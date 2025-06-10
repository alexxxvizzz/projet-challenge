import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
          shadowOpacity: 0,
        },
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: '#007CB0',
        },

        // ⬅️ Image à gauche
        headerLeft: () => (
          <Image
            source={{
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEPIHgzIIPcxP-DOsghno4c-bUS3qGjBsdcw&s',
            }}
            style={{
              width: 60,
              height: 60,
              marginLeft: 15,
              borderRadius: 5,
            }}
          />
        ),

        // ➡️ Logo EPF à droite
        headerRight: () => (
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e9/EPF_logo_2021.png/1200px-EPF_logo_2021.png',
            }}
            style={{
              width: 50,
              height: 50,
              marginRight: 15,
              resizeMode: 'contain',
            }}
          />
        ),

        tabBarStyle: {
  backgroundColor: '#fff',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: Platform.OS === 'ios' ? 90 : 70,
  paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  paddingTop: 10,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  borderTopWidth: 0,
  elevation: 10, // pour Android
  shadowColor: '#000', // pour iOS
  shadowOffset: { width: 0, height: -3 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
},
        tabBarActiveTintColor: '#007CB0',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="articles"
        options={{
          title: 'Articles',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Événements',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="studies"
        options={{
          title: 'Études',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
