import firestore from '@react-native-firebase/firestore';


export class FirebaseService {
  /**
   * Fetches all events from Firestore
   * @returns {Promise<Array>} 
   */
  static async fetchEvents() {
    try {
      const eventsCollection = await firestore().collection('events').get();
      
      const events = eventsCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JavaScript Date
        date: doc.data().date?.toDate() || new Date(),
      }));
      
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Updates RSVP status for a specific event and user
   * @param {string} eventId - The event ID
   * @param {string} userId - The user ID
   * @param {boolean} rsvpStatus - RSVP status (true/false)
   */
  static async updateRSVP(eventId, userId, rsvpStatus) {
    try {
      const rsvpRef = firestore()
        .collection('events')
        .doc(eventId)
        .collection('rsvps')
        .doc(userId);
      
      await rsvpRef.set({
        userId,
        rsvpStatus,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating RSVP:', error);
      throw error;
    }
  }

  /**
   * Gets RSVP status for a specific user and event
   * @param {string} eventId - The event ID
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} RSVP status
   */
  static async getRSVPStatus(eventId, userId) {
    try {
      const rsvpDoc = await firestore()
        .collection('events')
        .doc(eventId)
        .collection('rsvps')
        .doc(userId)
        .get();
      
      return rsvpDoc.exists ? rsvpDoc.data().rsvpStatus : false;
    } catch (error) {
      console.error('Error getting RSVP status:', error);
      return false;
    }
  }
}