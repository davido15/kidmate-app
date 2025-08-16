import React from 'react';
import { View, StyleSheet } from 'react-native';
import GooglePlacesSimpleTest from '../components/GooglePlacesSimpleTest';

const TestGooglePlacesScreen = () => {
  return (
    <View style={styles.container}>
      <GooglePlacesSimpleTest />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default TestGooglePlacesScreen; 