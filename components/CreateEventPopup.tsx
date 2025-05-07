import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import COLORS from '../constants/colors';

interface CreateEventPopupProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 100; // How far to drag down before dismissing

const CreateEventPopup: React.FC<CreateEventPopupProps> = ({
  visible,
  onClose,
  onCreateEvent
}) => {
  // Animation value for sliding
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Track if we're in the middle of dismissing to prevent duplicate calls
  const isDismissing = useRef(false);

  // Setup pan responder for handling gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        // Only allow downward movement (positive dy)
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        // If dragged down past threshold, dismiss
        if (gestureState.dy > DISMISS_THRESHOLD && !isDismissing.current) {
          isDismissing.current = true;
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            isDismissing.current = false;
          });
        } else {
          // Otherwise, snap back to original position
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else if (!isDismissing.current) {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      {/* Handle area - use this as the main drag target */}
      <View
        style={styles.handleContainer}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create an event at this location?</Text>
        <Text style={styles.subtitle}>Tap create to set up your sports activity or swipe down to cancel</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.createButton} onPress={onCreateEvent}>
            <Text style={styles.createButtonText}>Create Event</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  content: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 16,
  }
});

export default CreateEventPopup;
