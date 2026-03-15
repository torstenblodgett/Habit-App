import React from 'react';
import { StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { THEME } from '../../constants/theme';

function TabIcon({ name, color }: { name: string; color: string }) {
  return <SymbolView name={name as any} tintColor={color} size={24} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.text.primary,
        tabBarInactiveTintColor: THEME.text.tertiary,
        tabBarStyle: {
          backgroundColor: THEME.bg,
          borderTopColor: THEME.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon name="bolt.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="identity"
        options={{
          title: 'Identity',
          tabBarIcon: ({ color }) => <TabIcon name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <TabIcon name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <TabIcon name="list.bullet" color={color} />,
        }}
      />
      {/* Hide the boilerplate template tab */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
