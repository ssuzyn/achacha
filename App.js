import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import PermissionScreen from './src/screens/PermissionScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <PermissionScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
