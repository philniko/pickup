import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import COLORS from '../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text,
        headerStyle: {
          backgroundColor: 'white',
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: 'white',
          height: 60,
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 },
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 56,
              height: 56,
              backgroundColor: focused ? COLORS.secondary : '#e0e0e0',
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 28,
              borderWidth: 4,
              borderColor: 'white',
            }}>
              <Ionicons
                name={focused ? 'map' : 'map-outline'}
                color={focused ? 'white' : COLORS.text}
                size={28}
              />
            </View>
          ),
          tabBarItemStyle: {
            height: 60,
          }
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
