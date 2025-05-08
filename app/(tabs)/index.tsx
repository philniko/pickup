import { View, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import MapView, { Region, Marker, Callout } from 'react-native-maps';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import CreateEventPopup from '../../components/CreateEventPopup';
import CreateEventWizard from '../../components/CreateEventWizard';
import { supabase } from '../../utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Interface for events from database
interface Event {
  id: string;
  name: string;
  sport: string;
  description: string | null;
  datetime: string;
  max_players: number;
  latitude: number;
  longitude: number;
}

export default function Index() {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // State for the event creation flow
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // State for events from database
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Optimization for marker tracking
  const [markerTracking, setMarkerTracking] = useState(true);

  // Add ref for tracking pending marker state
  const pendingMarkerRef = useRef(false);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Track focus status
  const isScreenFocused = useRef(false);

  // Fetch events from Supabase with better error handling
  const fetchEvents = useCallback(async (forceRefresh = false) => {
    if (!isMountedRef.current) return; // Prevent fetching if component is unmounted

    try {
      if (forceRefresh || !isLoadingEvents) {
        setIsLoadingEvents(true);
      }

      console.log('Fetching events from Supabase...');

      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        console.error('Error fetching events:', error);
        Alert.alert('Error', 'Failed to load events. Please try again.');
        return;
      }

      if (data && isMountedRef.current) {
        console.log(`Successfully fetched ${data.length} events`);
        setEvents(data as Event[]);

        // Mark initial load as complete
        if (!initialLoadDone) {
          setInitialLoadDone(true);
        }
      } else if (isMountedRef.current) {
        console.log('No events found in database');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Something went wrong while loading events.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingEvents(false);
      }
    }
  }, [initialLoadDone]);

  // Handle a new event being created
  const handleEventCreated = useCallback((newEvent: Event) => {
    console.log('New event created:', newEvent);

    // Immediately update the events array with the new event
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, newEvent];
      console.log(`Events array updated, now contains ${updatedEvents.length} events`);
      return updatedEvents;
    });
  }, []);

  // Use React Navigation's useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - refreshing events');
      isScreenFocused.current = true;

      // When coming back to this screen, force a refresh
      fetchEvents(true);

      return () => {
        isScreenFocused.current = false;
        console.log('Screen unfocused');
      };
    }, [fetchEvents])
  );

  // Separate useEffect for location
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
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
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

    // Set mounted flag
    isMountedRef.current = true;

    // Clean up the mounted flag when component unmounts
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Turn off marker tracking after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setMarkerTracking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Separate useEffect for fetching events on initial load
  useEffect(() => {
    console.log('Initial events load');
    // Fetch events immediately when component mounts
    fetchEvents(true);

    // Set up real-time subscription to events table
    const eventsSubscription = supabase
      .channel('events-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, (payload) => {
        console.log('Database change detected:', payload);
        // Only refresh if this screen is in focus
        if (isScreenFocused.current) {
          fetchEvents(true);
        }
      })
      .subscribe((status) => {
        console.log('Supabase subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up subscriptions');
      eventsSubscription.unsubscribe();
    };
  }, [fetchEvents]);

  // Effect to reset pending marker flag when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      pendingMarkerRef.current = false;
    }
    return () => {
      pendingMarkerRef.current = false;
    };
  }, [selectedLocation]);

  // Handle map press with immediate feedback
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;

    // Create new coordinate
    const newCoordinate = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude
    };

    // Show marker immediately
    pendingMarkerRef.current = true;
    setSelectedLocation(newCoordinate);

    // Show popup in next render cycle
    requestAnimationFrame(() => {
      setShowPopup(true);
    });
  };

  // Start the event creation wizard
  const handleCreateEvent = () => {
    setShowPopup(false);
    setShowWizard(true);
  };

  // Close the popup and reset state
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedLocation(null);
  };

  // Close the wizard
  const handleCloseWizard = () => {
    setShowWizard(false);
    setSelectedLocation(null);
    // No need to call fetchEvents here as we're using the handleEventCreated callback
  };

  // Helper function to format date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to get icon for sport
  const getSportIcon = (sport: string) => {
    const sportIcons: { [key: string]: string } = {
      'Basketball': 'basketball',
      'Football': 'football',
      'Baseball': 'baseball',
      'Tennis': 'tennisball',
      'Golf': 'golf',
      'Cycling': 'bicycle',
      'Soccer': 'football-outline',
      'Volleyball': 'hand-left-outline'
    };

    return sportIcons[sport] || 'fitness-outline';
  };

  // Memoize event markers for better performance
  const eventMarkers = useMemo(() => {
    return events.map((event) => (
      <Marker
        key={`event-${event.id}`}
        coordinate={{
          latitude: event.latitude,
          longitude: event.longitude
        }}
        tracksViewChanges={markerTracking}
      >
        <View style={[styles.eventMarkerDot, styles.existingEventMarker]}>
          <Ionicons
            name={getSportIcon(event.sport) as any}
            size={12}
            color="#FFFFFF"
          />
        </View>

        <Callout tooltip style={styles.calloutContainer}>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{event.name}</Text>
            <View style={styles.calloutDetail}>
              <Ionicons
                name={getSportIcon(event.sport) as any}
                size={14}
                color={COLORS.text}
                style={styles.calloutIcon}
              />
              <Text style={styles.calloutText}>{event.sport}</Text>
            </View>
            <View style={styles.calloutDetail}>
              <Ionicons
                name="calendar"
                size={14}
                color={COLORS.text}
                style={styles.calloutIcon}
              />
              <Text style={styles.calloutText}>
                {formatEventDate(event.datetime)}
              </Text>
            </View>
            <View style={styles.calloutDetail}>
              <Ionicons
                name="people"
                size={14}
                color={COLORS.text}
                style={styles.calloutIcon}
              />
              <Text style={styles.calloutText}>
                {event.max_players} players
              </Text>
            </View>
          </View>
        </Callout>
      </Marker>
    ));
  }, [events, markerTracking]);

  return (
    <View style={styles.container}>
      {/* Show a loading indicator while fetching events on initial load */}
      {isLoadingEvents && !initialLoadDone && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        region={region}
        onLongPress={handleMapPress}
        onMapReady={() => {
          console.log('Map is ready');
          // Force event refresh once map is ready
          if (events.length === 0 && !isLoadingEvents) {
            console.log('Map ready but no events, retrying fetch');
            fetchEvents(true);
          }
        }}
      >
        {/* User's current location marker */}
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude
          }}
          tracksViewChanges={markerTracking}
        >
          <View style={styles.userMarkerContainer}>
            <View style={styles.userMarkerDot} />
          </View>
        </Marker>

        {/* Selected location marker - optimized */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            tracksViewChanges={markerTracking}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.eventMarkerDot} />
          </Marker>
        )}

        {/* Event markers from database - now memoized */}
        {eventMarkers}
      </MapView>

      {/* Create Event Popup */}
      <CreateEventPopup
        visible={showPopup}
        onClose={handleClosePopup}
        onCreateEvent={handleCreateEvent}
      />

      {/* Create Event Wizard */}
      {selectedLocation && showWizard && (
        <CreateEventWizard
          visible={showWizard}
          onClose={handleCloseWizard}
          coordinates={selectedLocation}
          onEventCreated={handleEventCreated}
        />
      )}
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
  loadingOverlay: {
    position: 'absolute',
    zIndex: 1000,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  userMarkerDot: {
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
  },
  eventMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  eventMarkerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  existingEventMarker: {
    backgroundColor: COLORS.primary,
  },
  calloutContainer: {
    width: 220,
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  calloutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  calloutIcon: {
    marginRight: 6,
  },
  calloutText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
