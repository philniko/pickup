import { View, StyleSheet, Alert } from 'react-native';
import COLORS from '../../constants/colors';
import MapView, { Region, Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function Index() {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,  // Default location (can be any default you prefer)
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to access your current location.',
            [{ text: 'OK' }]
          );
        }
        
        let location = await Location.getCurrentPositionAsync({});
        
        // Update region with user's location
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        alert("Unable to retrieve your location. Using default location.");
      }
    }
    
    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={region}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude
          }}
          tracksViewChanges={false}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerDot} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    width: '100%',
    height: '100%'
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  markerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});