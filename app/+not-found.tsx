import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Today</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.bg,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 15,
    color: THEME.accent,
  },
});
