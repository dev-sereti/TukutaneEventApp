import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';
import { FirebaseService } from '../services/firebaseConfig';


const EventListScreen = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  /**
   * Filter events when category selection changes
   */
  useEffect(() => {
    filterEventsByCategory();
  }, [events, selectedCategory]);

  /**
   * Loads events from Firebase and processes categories
   */
  const loadEvents = async () => {
    try {
      const fetchedEvents = await FirebaseService.fetchEvents();
      
      // Sort events by date (upcoming first)
      const sortedEvents = fetchedEvents.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setEvents(sortedEvents);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(sortedEvents.map(event => event.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert(
        'Error',
        'Failed to load events. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: loadEvents },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Filters events based on selected category
   */
  const filterEventsByCategory = () => {
    if (selectedCategory === 'All') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.category === selectedCategory
      );
      setFilteredEvents(filtered);
    }
  };

  /**
   * Handles category selection
   */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  /**
   * Handles pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadEvents();
  }, []);

  /**
   * Renders individual event item
   */
  const renderEventItem = ({ item }) => (
    <EventCard event={item} />
  );

  /**
   * Renders empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {selectedCategory === 'All' ? 'No Events Available' : `No ${selectedCategory} Events`}
      </Text>
      <Text style={styles.emptyStateMessage}>
        {selectedCategory === 'All' 
          ? 'Check back later for new events!' 
          : `Try selecting a different category or check back later for ${selectedCategory} events.`
        }
      </Text>
    </View>
  );

  /**
   * Generates unique key for FlatList items
   */
  const keyExtractor = (item) => item.id;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tukutane Events</Text>
        <Text style={styles.headerSubtitle}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} available
        </Text>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Event List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={keyExtractor}
        style={styles.eventList}
        contentContainerStyle={[
          styles.eventListContent,
          filteredEvents.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  eventList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  eventListContent: {
    paddingVertical: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EventListScreen;
