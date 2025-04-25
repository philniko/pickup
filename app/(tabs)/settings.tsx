import { Text, View, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Using the soft gray from our palette
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.text, // Using the dark navy from our palette
  },
});
