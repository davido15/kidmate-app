import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, FlatList } from 'react-native';

// Dummy data for fallback
const dummySuggestions = [
  { description: 'Home Address', place_id: 'home', latitude: 0, longitude: 0 },
  { description: 'School Location', place_id: 'school', latitude: 0, longitude: 0 },
  { description: 'Shopping Center', place_id: 'shopping', latitude: 0, longitude: 0 },
  { description: 'Park', place_id: 'park', latitude: 0, longitude: 0 },
  { description: 'Hospital', place_id: 'hospital', latitude: 0, longitude: 0 },
  { description: 'Library', place_id: 'library', latitude: 0, longitude: 0 },
  { description: 'Restaurant', place_id: 'restaurant', latitude: 0, longitude: 0 },
  { description: 'Gas Station', place_id: 'gas_station', latitude: 0, longitude: 0 },
];

const GooglePlacesInput = ({ 
  placeholder = 'Search location...', 
  onLocationSelect, 
  style,
  containerStyle,
  textInputStyle,
  listViewStyle
}) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2) {
      // Filter dummy data based on search text
      const filtered = dummySuggestions.filter(item => 
        item.description.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (item) => {
    setSearchText(item.description);
    setShowSuggestions(false);
    if (onLocationSelect) {
      onLocationSelect({
        description: item.description,
        place_id: item.place_id,
        latitude: item.latitude,
        longitude: item.longitude
      });
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.textInput, textInputStyle]}
        placeholder={placeholder}
        value={searchText}
        onChangeText={handleSearch}
        placeholderTextColor="#999"
        returnKeyType="search"
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.listView, listViewStyle]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleSelectLocation(item)}
              >
                <Text style={styles.description}>{item.description}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 5,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333'
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
    maxHeight: 200,
  },
  row: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  description: {
    fontSize: 14,
    color: '#333'
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0'
  }
});

export default GooglePlacesInput;