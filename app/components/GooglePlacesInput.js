import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import colors from '../config/colors';

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
  const [loading, setLoading] = useState(false);

  const searchPlaces = async (text) => {
    if (text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const API_KEY = 'AIzaSyDI3BeN_0gsceNXmsWV2aWytqUIr5xbKBQ';
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(text)}&inputtype=textquery&fields=formatted_address,name,geometry&key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.candidates) {
        const places = data.candidates.map(place => ({
          description: place.name + ' - ' + place.formatted_address,
          place_id: place.place_id || Math.random().toString(),
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
          name: place.name,
          formatted_address: place.formatted_address
        }));
        setSuggestions(places);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2) {
      searchPlaces(text);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (item) => {
    // Set the display text to show the location name and address
    const displayText = item.name ? `${item.name}, ${item.formatted_address}` : item.formatted_address;
    setSearchText(displayText);
    setShowSuggestions(false);
    
    // Safely extract coordinates with fallback
    let latitude = null;
    let longitude = null;
    
    try {
      // Use the coordinates that were already extracted in searchPlaces
      latitude = item.latitude;
      longitude = item.longitude;
      
      // If those are not available, try to extract from geometry
      if (!latitude || !longitude) {
        if (item.geometry?.location) {
          latitude = item.geometry.location.lat;
          longitude = item.geometry.location.lng;
        }
      }
    } catch (error) {
      console.error('Error extracting coordinates:', error);
      console.log('Item structure:', item);
    }
    
    if (onLocationSelect) {
      onLocationSelect({
        description: displayText,
        place_id: item.place_id,
        latitude: latitude,
        longitude: longitude,
        name: item.name,
        formatted_address: item.formatted_address
      });
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, textInputStyle]}
          placeholder={placeholder}
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={colors.primary} 
            style={styles.loadingIndicator}
          />
        )}
      </View>
      
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
                <View style={styles.locationIcon}>
                  <Text style={styles.iconText}>📍</Text>
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{item.name}</Text>
                  <Text style={styles.locationAddress}>{item.formatted_address}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEnabled={false}
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
    zIndex: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 40,
    fontSize: 16,
    backgroundColor: '#fff',
    color: colors.dark
  },
  loadingIndicator: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 8,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
    zIndex: 2,
  },
  row: {
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: colors.medium,
  },
  separator: {
    height: 1,
    backgroundColor: colors.light
  }
});

export default GooglePlacesInput;