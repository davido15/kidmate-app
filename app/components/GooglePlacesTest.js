import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function GooglePlacesTest() {
  const [searchText, setSearchText] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const handlePress = (data, details = null) => {
    console.log('=== GOOGLE PLACES TEST ===');
    console.log('Raw data:', data);
    console.log('Details:', details);
    
    if (details) {
      const { name, formatted_address, geometry } = details;
      console.log("Place Name:", name);
      console.log("Address:", formatted_address);
      console.log("Latitude:", geometry.location.lat);
      console.log("Longitude:", geometry.location.lng);
      
      setLastResult({
        name,
        address: formatted_address,
        lat: geometry.location.lat,
        lng: geometry.location.lng
      });
      
      Alert.alert(
        'Location Selected',
        `Name: ${name}\nAddress: ${formatted_address}\nLat: ${geometry.location.lat}\nLng: ${geometry.location.lng}`
      );
    } else {
      console.log('No details available');
      Alert.alert('No Details', 'Location selected but no details available');
    }
  };

  const handleError = (error) => {
    console.error('Google Places Error:', error);
    Alert.alert('Error', `Google Places error: ${error.message || 'Unknown error'}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Google Places API Test</Text>
        <Text style={styles.subtitle}>API Key: {`${'AIzaSyDI3BeN_0gsceNXmsWV2aWytqUIr5xbKBQ'.substring(0, 10)}...`}</Text>
      </View>

      <GooglePlacesAutocomplete
        placeholder="Search for a place (e.g., 'restaurant', 'school')"
        onPress={handlePress}
        onFail={handleError}
        onNotFound={() => {
          console.log('No results found');
          Alert.alert('No Results', 'No places found for your search');
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        query={{
          key: 'AIzaSyDI3BeN_0gsceNXmsWV2aWytqUIr5xbKBQ',
          language: 'en',
          types: 'establishment|geocode',
          components: 'country:us' // Optional: restrict to US
        }}
        textInputProps={{
          onChangeText: setSearchText,
          value: searchText,
          placeholderTextColor: '#999',
          returnKeyType: 'search',
          clearButtonMode: 'while-editing'
        }}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          separator: styles.separator,
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
        minLength={2}
        autoFillOnNotFound={false}
        listEmptyComponent={() => (
          <View style={styles.emptyComponent}>
            <Text style={styles.emptyText}>No places found</Text>
          </View>
        )}
      />

      {lastResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Selected Location:</Text>
          <Text style={styles.resultText}>Name: {lastResult.name}</Text>
          <Text style={styles.resultText}>Address: {lastResult.address}</Text>
          <Text style={styles.resultText}>Lat: {lastResult.lat}</Text>
          <Text style={styles.resultText}>Lng: {lastResult.lng}</Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Testing Instructions:</Text>
        <Text style={styles.instructionText}>1. Type in the search box above</Text>
        <Text style={styles.instructionText}>2. Try searching for: "restaurant", "school", "hospital"</Text>
        <Text style={styles.instructionText}>3. Select a location from the dropdown</Text>
        <Text style={styles.instructionText}>4. Check console logs for detailed information</Text>
        <Text style={styles.instructionText}>5. If no results appear, check your API key and internet connection</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  autocompleteContainer: {
    flex: 0,
    marginHorizontal: 20,
    marginTop: 20,
    zIndex: 1000,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  emptyComponent: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  resultContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  instructions: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
