import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import { getPickupPersons, formatPickupDate, formatPickupTime, togglePickupPersonStatus } from "../api/pickup";

const PickupPersonItem = ({ item, onPress, onToggleStatus }) => {
  return (
    <View style={styles.pickupItem}>
      <TouchableOpacity onPress={() => onPress(item)} style={styles.pickupContent}>
        <View style={styles.pickupHeader}>
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupName}>{item.name}</Text>
            <Text style={styles.pickupRelationship}>Pickup Person</Text>
          </View>
          <View style={styles.pickupStatus}>
            <MaterialIcons 
              name={item.is_active ? "check-circle" : "cancel"} 
              size={24} 
              color={item.is_active ? "#4CAF50" : "#F44336"} 
            />
          </View>
        </View>
        
        <View style={styles.pickupDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="child-care" size={16} color="#666" />
            <Text style={styles.detailText}>{item.kid_name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="qr-code" size={16} color="#666" />
            <Text style={styles.detailText}>Pickup ID: {item.pickup_id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="fingerprint" size={16} color="#666" />
            <Text style={styles.detailText}>UUID: {item.uuid}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="info" size={16} color="#666" />
            <Text style={styles.detailText}>
              Status: {item.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            { backgroundColor: item.is_active ? "#F44336" : "#4CAF50" }
          ]}
          onPress={() => onToggleStatus(item)}
        >
          <Text style={styles.toggleButtonText}>
            {item.is_active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PickupPersonsListScreen({ navigation }) {
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Add header with back button and add button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Pickup Persons",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ color: '#007AFF', fontSize: 16, marginLeft: 4 }}>← Back</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("UploadPickupPerson")}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: '#007AFF', fontSize: 16 }}>Add New</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchPickupPersons = async () => {
    try {
      setError(null);
      const response = await getPickupPersons();
      
      if (response.ok && response.data && response.data.success) {
        setPickupPersons(response.data.pickup_persons || []);
      } else {
        setError(response.data?.error || response.error || "Failed to fetch pickup persons");
      }
    } catch (err) {
      console.error("Error fetching pickup persons:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPickupPersons();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPickupPersons();
  };

  const handlePickupPress = (pickupPerson) => {
    Alert.alert(
      "Pickup Person Details",
      `Name: ${pickupPerson.name}\nChild: ${pickupPerson.kid_name}\nPickup ID: ${pickupPerson.pickup_id}\nUUID: ${pickupPerson.uuid}\nStatus: ${pickupPerson.is_active ? "Active" : "Inactive"}`,
      [{ text: "OK" }]
    );
  };

  const handleToggleStatus = async (pickupPerson) => {
    try {
      const response = await togglePickupPersonStatus(pickupPerson.id);
      
      if (response.ok && response.data && response.data.success) {
        // Update the local state to reflect the change
        setPickupPersons(prevPersons => 
          prevPersons.map(person => 
            person.id === pickupPerson.id 
              ? { ...person, is_active: !person.is_active }
              : person
          )
        );
        
        Alert.alert(
          "Success",
          `Pickup person ${pickupPerson.name} has been ${!pickupPerson.is_active ? "activated" : "deactivated"}.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error",
          response.data?.error || "Failed to update pickup person status",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error toggling pickup person status:", error);
      Alert.alert(
        "Error",
        "Network error. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading pickup persons...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPickupPersons}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : pickupPersons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="person-off" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Pickup Persons</Text>
          <Text style={styles.emptyText}>
            You haven't added any pickup persons yet.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("UploadPickupPerson")}
          >
            <Text style={styles.addButtonText}>Add Pickup Person</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pickupPersons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PickupPersonItem 
              item={item} 
              onPress={handlePickupPress} 
              onToggleStatus={handleToggleStatus}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  pickupItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pickupInfo: {
    flex: 1,
  },
  pickupName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  pickupRelationship: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  pickupStatus: {
    alignItems: "center",
  },
  pickupDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  pickupContent: {
    flex: 1,
  },
  toggleContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
}); 