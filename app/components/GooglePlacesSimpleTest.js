import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import Screen from './Screen';
import AppText from './AppText';
import colors from '../config/colors';

export default function GooglePlacesSimpleTest() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([
    {
      name: "McDonald's Restaurant",
      formatted_address: "123 Main Street, Accra, Ghana",
      geometry: {
        location: {
          lat: 5.5974472,
          lng: -0.1817397
        }
      }
    },
    {
      name: "KFC Chicken Restaurant",
      formatted_address: "456 Oak Avenue, Accra, Ghana", 
      geometry: {
        location: {
          lat: 5.5981234,
          lng: -0.1823456
        }
      }
    },
    {
      name: "Pizza Hut Delivery",
      formatted_address: "789 Pine Road, Accra, Ghana",
      geometry: {
        location: {
          lat: 5.5998765,
          lng: -0.1834567
        }
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const testGooglePlacesAPI = async () => {
    if (!searchText.trim()) {
      return;
    }

    setLoading(true);
    try {
      const API_KEY = 'AIzaSyDI3BeN_0gsceNXmsWV2aWytqUIr5xbKBQ';
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchText)}&inputtype=textquery&fields=formatted_address,name,geometry&key=${API_KEY}`;
      
      console.log('Testing API with URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.status === 'OK') {
        const candidates = data.candidates || [];
        console.log('Setting results:', candidates);
        console.log('Results length:', candidates.length);
        setResults(candidates);
      } else {
        console.log('API Error:', data.status, data.error_message);
        setResults([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // You can add refresh logic here if needed
    setRefreshing(false);
  };

  const renderPlaceItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.placeItem}>
        <View style={styles.placeHeader}>
          <AppText style={styles.placeName}>{item.name || 'No name'}</AppText>
          <View style={styles.locationIcon}>
            <AppText style={styles.iconText}>📍</AppText>
          </View>
        </View>
        
        <View style={styles.placeDetails}>
          <AppText style={styles.placeAddress}>{item.formatted_address || 'No address'}</AppText>
          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateItem}>
              <AppText style={styles.coordinateLabel}>Lat:</AppText>
              <AppText style={styles.coordinateValue}>
                {item.geometry?.location?.lat?.toFixed(6) || 'N/A'}
              </AppText>
            </View>
            <View style={styles.coordinateItem}>
              <AppText style={styles.coordinateLabel}>Lng:</AppText>
              <AppText style={styles.coordinateValue}>
                {item.geometry?.location?.lng?.toFixed(6) || 'N/A'}
              </AppText>
            </View>
          </View>
          <AppText style={styles.tapText}>Tap to view details</AppText>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Searching for places...</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.title}>Google Places Search</AppText>
        <AppText style={styles.subtitle}>
          {results.length} places found
        </AppText>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter search term (e.g., restaurant)"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={testGooglePlacesAPI}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testGooglePlacesAPI}
          disabled={loading}
        >
          <AppText style={styles.buttonText}>
            {loading ? 'Searching...' : 'Search'}
          </AppText>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={results}
        renderItem={renderPlaceItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No places found</AppText>
            <AppText style={styles.emptySubtext}>Search for places to get started</AppText>
          </View>
        }
        nestedScrollEnabled={true}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: 20,
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  textInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: colors.white,
    fontSize: 14,
    color: colors.dark,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.light,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
  },
  placeItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  locationIcon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.light,
  },
  iconText: {
    fontSize: 16,
  },
  placeDetails: {
    marginTop: 8,
  },
  placeAddress: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
    lineHeight: 20,
  },
  coordinatesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  coordinateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  coordinateLabel: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: "500",
    marginRight: 5,
  },
  coordinateValue: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: "bold",
  },
  tapText: {
    fontSize: 12,
    color: colors.secondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.grey,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
  },
}); 