import { AddCalendarEvent } from 'react-native-add-calendar-event';
import { Alert, Platform } from 'react-native';

export class CalendarUtils {
  /**
   * Adds an event to the device calendar
   * @param {Object} event - Event object containing event details
   */
  static async addToCalendar(event) {
    try {
      // Format the event data for calendar
      const eventConfig = {
        title: event.name,
        startDate: event.date.toISOString(),
        endDate: new Date(event.date.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
        location: event.location || '',
        notes: event.description || '',
        url: event.url || '',
      };

      // Use different approaches for iOS and Android
      if (Platform.OS === 'ios') {
        // For iOS, we can use the native calendar API
        const eventId = await AddCalendarEvent.presentEventCreatingDialog(eventConfig);
        
        if (eventId) {
          Alert.alert('Success', 'Event added to calendar successfully!');
        }
      } else {
        // For Android, present the event dialog
        AddCalendarEvent.presentEventCreatingDialog(eventConfig)
          .then((eventInfo) => {
            if (eventInfo.action === 'SAVED') {
              Alert.alert('Success', 'Event added to calendar successfully!');
            }
          })
          .catch((error) => {
            console.error('Calendar error:', error);
            Alert.alert('Error', 'Could not add event to calendar');
          });
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Could not add event to calendar');
    }
  }

  /**
   * Formats date for display
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
