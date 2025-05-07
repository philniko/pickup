import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, Platform, SafeAreaView, ScrollView, KeyboardAvoidingView,
  Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import COLORS from '../constants/colors';
import { supabase } from '../utils/supabase';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface CreateEventWizardProps {
  visible: boolean;
  onClose: () => void;
  coordinates: Coordinates;
  onEventCreated?: (eventData: any) => void; // Callback for immediate update
}

type SportOption = {
  icon: string;
  name: string;
}

const sportOptions: SportOption[] = [
  { icon: 'basketball', name: 'Basketball' },
  { icon: 'football', name: 'Football' },
  { icon: 'baseball', name: 'Baseball' },
  { icon: 'tennisball', name: 'Tennis' },
  { icon: 'golf', name: 'Golf' },
  { icon: 'bicycle', name: 'Cycling' },
  { icon: 'football-outline', name: 'Soccer' },
  { icon: 'hand-left-outline', name: 'Volleyball' }
];

const CreateEventWizard: React.FC<CreateEventWizardProps> = ({
  visible,
  onClose,
  coordinates,
  onEventCreated // Use this callback to notify parent component
}) => {
  // State for each step
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState('');
  const [eventSport, setEventSport] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [numPlayers, setNumPlayers] = useState('4');
  const [isLoading, setIsLoading] = useState(false);

  // For date/time formatting
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show only date picker
  const showDatePickerOnly = () => {
    setShowTimePicker(false);
    setShowDatePicker(true);
  };

  // Show only time picker
  const showTimePickerOnly = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  // Handle date and time change
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || eventDate;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setShowTimePicker(false);
    setEventDate(currentDate);
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || eventTime;
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    setShowDatePicker(false);
    setEventTime(currentTime);
  };

  // Reset the form
  const resetForm = () => {
    setStep(1);
    setEventName('');
    setEventSport('');
    setEventDescription('');
    setEventDate(new Date());
    setEventTime(new Date());
    setNumPlayers('4');
  };

  // Handle next step
  const goToNextStep = () => {
    if (step === 1 && !eventName) {
      Alert.alert('Missing Information', 'Please enter an event name');
      return;
    }

    if (step === 2 && !eventSport) {
      Alert.alert('Missing Information', 'Please select a sport for your event');
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      createEvent();
    }
  };

  // Handle previous step
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      resetForm();
      onClose();
    }
  };

  // Create the event with Supabase integration
  const createEvent = async () => {
    // Create a datetime by combining date and time
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(eventTime.getHours());
    eventDateTime.setMinutes(eventTime.getMinutes());

    // Prepare the event data
    const eventData = {
      name: eventName,
      sport: eventSport,
      description: eventDescription,
      datetime: eventDateTime.toISOString(),
      max_players: parseInt(numPlayers),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      created_at: new Date().toISOString(),
    };

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        if (error.code === '42501') {
          Alert.alert(
            'Permission Error',
            'You may need to adjust the security settings in your Supabase dashboard. Please disable RLS or add appropriate policies for the events table.',
            [{ text: 'OK' }]
          );
        }
        throw error;
      }

      // Call the callback with the created event data for immediate update
      if (onEventCreated && data) {
        console.log('Calling onEventCreated with new event data');
        onEventCreated(data);
      } else {
        console.log('onEventCreated callback not available or data not returned');
      }

      setIsLoading(false);

      // Show success alert
      Alert.alert(
        'Event Created!',
        `New ${eventSport} event "${eventName}" has been created at ${formatDate(eventDate)} ${formatTime(eventTime)}.`,
        [{
          text: 'OK', onPress: () => {
            // Reset form and close
            resetForm();
            onClose();
          }
        }]
      );

      console.log('Event created with ID:', data ? data.id : 'unknown');

    } catch (error) {
      setIsLoading(false);

      Alert.alert(
        'Error',
        'Failed to create event. Please try again later.',
        [{ text: 'OK' }]
      );

      console.error('Error creating event:', error);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.inputLabel}>What's your event called?</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Name"
              value={eventName}
              onChangeText={setEventName}
              autoFocus
              placeholderTextColor="#9E9E9E"
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.inputLabel}>What sport will you play?</Text>
            <View style={styles.sportOptions}>
              {sportOptions.map((sport, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sportOption,
                    eventSport === sport.name && styles.selectedSportOption
                  ]}
                  onPress={() => setEventSport(sport.name)}
                >
                  <Ionicons
                    name={sport.icon as any}
                    size={24}
                    color={eventSport === sport.name ? 'white' : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.sportName,
                      eventSport === sport.name && styles.selectedSportName
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.inputLabel}>Describe your event</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What should players know about this event? (experience level, equipment needed, etc.)"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9E9E9E"
              textAlignVertical="top"
            />
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.inputLabel}>When is your event?</Text>

            {/* Date Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showDatePickerOnly}
            >
              <Ionicons name="calendar-outline" size={22} color={COLORS.text} style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>{formatDate(eventDate)}</Text>
              <Ionicons name="chevron-down" size={16} color="#9E9E9E" />
            </TouchableOpacity>

            {/* Time Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={showTimePickerOnly}
            >
              <Ionicons name="time-outline" size={22} color={COLORS.text} style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>{formatTime(eventTime)}</Text>
              <Ionicons name="chevron-down" size={16} color="#9E9E9E" />
            </TouchableOpacity>

            {/* Date picker for iOS and Android */}
            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time picker for iOS and Android */}
            {showTimePicker && (
              <DateTimePicker
                value={eventTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.inputLabel}>How many players do you need?</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumPlayers(Math.max(1, parseInt(numPlayers) - 1).toString())}
              >
                <Ionicons name="remove" size={24} color={COLORS.text} />
              </TouchableOpacity>

              <TextInput
                style={styles.counterInput}
                value={numPlayers}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setNumPlayers(numericText || '1');
                }}
                keyboardType="number-pad"
                maxLength={2}
              />

              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumPlayers((parseInt(numPlayers) + 1).toString())}
              >
                <Ionicons name="add" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Including yourself</Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={goToPreviousStep}
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Create Event</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                {[1, 2, 3, 4, 5].map((stepNumber) => (
                  <View
                    key={stepNumber}
                    style={[
                      styles.progressStep,
                      step >= stepNumber ? styles.progressStepActive : {}
                    ]}
                  />
                ))}
              </View>

              {/* Form Content */}
              <ScrollView style={styles.formContent}>
                {renderStepContent()}
              </ScrollView>

              {/* Footer with Next/Create Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextStep}
                  disabled={isLoading}
                >
                  {isLoading && step === 5 ? (
                    <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                  ) : null}
                  <Text style={styles.nextButtonText}>
                    {step < 5 ? 'Next' : 'Create Event'}
                  </Text>
                  {!isLoading && (
                    <Ionicons
                      name={step < 5 ? 'arrow-forward' : 'checkmark'}
                      size={20}
                      color="white"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  sportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  selectedSportOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportName: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  selectedSportName: {
    color: 'white',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: 12,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterInput: {
    width: 80,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.text,
    marginHorizontal: 16,
  },
  helperText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CreateEventWizard;
