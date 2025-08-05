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
import { getPickupPersons, formatPickupDate, formatPickupTime } from "../api/pickup";

const PickupPersonItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.pickupItem} onPress={() => onPress(item)}>
      <View style={styles.pickupHeader}>
        <View style={styles.pickupInfo}>
          <Text style={styles.pickupName}>{item.name}</Text>
          <Text style={styles.pickupRelationship}>Pickup Person</Text>
        </View>
        <View style={styles.pickupStatus}>
          <MaterialIcons name="person" size={24} color="#007AFF" />
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
      </View>
    </TouchableOpacity>
  );
};

export default function PickupPersonsListScreen({ navigation }) {
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
      `Name: ${pickupPerson.name}\nChild: ${pickupPerson.kid_name}\nPickup ID: ${pickupPerson.pickup_id}\nUUID: ${pickupPerson.uuid}`,
      [{ text: "OK" }]
    );
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Persons</Text>
        <View style={styles.headerSpacer} />
      </View>

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
            <PickupPersonItem item={item} onPress={handlePickupPress} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  headerSpacer: {
    width: 34,
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
}); 