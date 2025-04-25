import { Text, View, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Events screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.text,
  },
});
