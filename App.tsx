import React from 'react';
import { StatusBar } from 'react-native';
import EventListScreen from './src/screens/EventListScreen';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <EventListScreen />
    </>
  );
};

export default App;