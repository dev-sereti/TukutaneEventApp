import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirebaseService } from '../services/firebaseConfig';
import { CalendarUtils } from '../utils/calendarUtils';

const { width } = Dimensions.get('window');

/**
 * EventCard Component
 * Displays individual event information with RSVP and calendar functionality
 * 
 * Features:
 * - Event image with fallback
 * - Event name, category, and date
 * - RSVP button with status tracking
 * - Save to Calendar functionality
 * - Responsive design
 */

const EventCard = ({ event }) => {
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulated user ID - in a real app, this would come from authentication
  const userId = 'user123';

  /**
   * Load RSVP status when component mounts
   */
  useEffect(() => {
    loadRSVPStatus();
  }, []);

  /**
   * Loads the current RSVP status for this event
   */
  const loadRSVPStatus = async () => {
    try {
      const status = await FirebaseService.getRSVPStatus(event.id, userId);
      setIsRSVPed(status);
    } catch (error) {
      console.error('Error loading RSVP status:', error);
    }
  };

  /**
   * Handles RSVP button press
   * Updates Firebase and local state
   */
  const handleRSVP = async () => {
    setIsLoading(true);
    try {
      const newStatus = !isRSVPed;
      await FirebaseService.updateRSVP(event.id, userId, newStatus);
      setIsRSVPed(newStatus);
      
      Alert.alert(
        'RSVP Updated',
        newStatus ? 'You have RSVP\'d to this event!' : 'You have cancelled your RSVP.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating RSVP:', error);
      Alert.alert('Error', 'Could not update RSVP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   Handles adding event to calendar
   */
  const handleAddToCalendar = () => {
    CalendarUtils.addToCalendar(event);
  };

  /**
   * Gets the appropriate category icon
   */
  const getCategoryIcon = (category) => {
    const icons = {
      Tech: 'computer',
      Music: 'music-note',
      Sports: 'sports-soccer',
      Business: 'business-center',
      Education: 'school',
      Food: 'restaurant',
      Art: 'palette',
    };
    return icons[category] || 'event';
  };

  return (
    <View style={styles.card}>
      {/* Event Image */}
      <FastImage
        source={{
          uri: event.image || 'https://via.placeholder.com/300x200?text=Event+Image',
          priority: FastImage.priority.normal,
        }}
        style={styles.eventImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      
      {/* Event Details */}
      <View style={styles.cardContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventName} numberOfLines={2}>
            {event.name}
          </Text>
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Icon 
              name={getCategoryIcon(event.category)} 
              size={14} 
              color="#007AFF" 
            />
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        {/* Event Date */}
        <View style={styles.dateContainer}>
          <Icon name="schedule" size={16} color="#666" />
          <Text style={styles.dateText}>
            {CalendarUtils.formatDate(event.date)}
          </Text>
        </View>

        {/* Location (if available) */}
        {event.location && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* RSVP Button */}
          <TouchableOpacity
            style={[
              styles.rsvpButton,
              isRSVPed && styles.rsvpButtonActive,
            ]}
            onPress={handleRSVP}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Icon
              name={isRSVPed ? 'check-circle' : 'radio-button-unchecked'}
              size={18}
              color={isRSVPed ? '#fff' : '#007AFF'}
            />
            <Text
              style={[
                styles.rsvpButtonText,
                isRSVPed && styles.rsvpButtonTextActive,
              ]}
            >
              {isLoading ? 'Updating...' : isRSVPed ? 'RSVP\'d' : 'RSVP'}
            </Text>
          </TouchableOpacity>

          {/* Calendar Button */}
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleAddToCalendar}
            activeOpacity={0.8}
          >
            <Icon name="event" size={18} color="#666" />
            <Text style={styles.calendarButtonText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  rsvpButtonActive: {
    backgroundColor: '#007AFF',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  rsvpButtonTextActive: {
    color: '#fff',
  },
  calendarButton: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
});

export default EventCard;