import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import useUserRole from '../../hooks/useUserRole'; // ajuste le chemin si besoin

export default function TabLayout() {
  const isAdmin = useUserRole(); // true | false | null

  if (isAdmin === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007CB0" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
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

        // --- NAVIGATION TAB BAR STYLE AMÉLIORÉ ---
        tabBarActiveTintColor: '#007CB0',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8, // Ombre Android
          shadowColor: '#000', // Ombre iOS
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 60,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute',
          overflow: 'visible',
          paddingBottom: 2,
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="articlesAdmin"
        options={{
          href: isAdmin ? undefined : null,
          title: 'Articles',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="articles"
        options={{
          href: isAdmin ? null : undefined,
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
        name="eventsAdmin"
        options={{
          href: isAdmin ? undefined : null,
          title: 'Événements',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          href: isAdmin ? null : undefined,
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
          href: isAdmin ? null : undefined,
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
        name="studiesAdmin"
        options={{
          href: isAdmin ? undefined : null,
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
        name="postulStudies"
        options={{ href: null, 
          title: 'Candidatures',
        }}
      />
      <Tabs.Screen
        name="History"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="[id]"
        options={{ 
          href: null,
          title: 'Article',
        }}
      />
    </Tabs>
  );
}
