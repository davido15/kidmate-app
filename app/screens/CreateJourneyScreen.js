import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import colors from '../config/colors';
import GooglePlacesInput from '../components/GooglePlacesInput';
import { getPickupPersons } from '../api/pickup';
import authStorage from '../auth/storage';
import apiClient from '../api/client';

export default function CreateJourneyScreen({ route, navigation }) {
  const { children } = route.params || {};
  
  // State for form data
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedPickupPerson, setSelectedPickupPerson] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [showPickupPersonSelector, setShowPickupPersonSelector] = useState(false);
  
  // State for drop-off location
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffLocationName, setDropoffLocationName] = useState("");
  const [dropoffLocationAddress, setDropoffLocationAddress] = useState("");
  const [dropoffLatitude, setDropoffLatitude] = useState(null);
  const [dropoffLongitude, setDropoffLongitude] = useState(null);
  
  // State for API calls
  const [loading, setLoading] = useState(false);
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loadingPickupPersons, setLoadingPickupPersons] = useState(false);
  
  // State for QR code
  const [qrUrl, setQrUrl] = useState(null);
  const [createdJourney, setCreatedJourney] = useState(null);
  const qrRef = useRef();

  // Fetch pickup persons on component mount
  useEffect(() => {
    fetchPickupPersons();
  }, []);

  const fetchPickupPersons = async () => {
    try {
      setLoadingPickupPersons(true);
      const response = await getPickupPersons();
      if (response.ok && response.data && response.data.success) {
        setPickupPersons(response.data.pickup_persons);
        console.log("✅ Pickup persons fetched:", response.data.pickup_persons);
      } else {
        console.log("❌ Failed to fetch pickup persons:", response);
      }
    } catch (error) {
      console.error("Error fetching pickup persons:", error);
    } finally {
      setLoadingPickupPersons(false);
    }
  };

  const handleDropoffLocationSelect = (locationData) => {
    setDropoffLocation(locationData.description);
    setDropoffLocationName(locationData.name);
    setDropoffLocationAddress(locationData.formatted_address);
    setDropoffLatitude(locationData.latitude);
    setDropoffLongitude(locationData.longitude);
    
    console.log("📍 Dropoff location selected:", {
      name: locationData.name,
      address: locationData.formatted_address,
      coordinates: locationData.latitude && locationData.longitude 
        ? `${locationData.latitude}, ${locationData.longitude}` 
        : 'Coordinates not available',
      full_description: locationData.description
    });
  };

  const handleCreateJourney = async () => {
    try {
      // Validation
      if (!selectedChild) {
        Alert.alert("Error", "Please select a child.");
        return;
      }

      if (!selectedPickupPerson) {
        Alert.alert("Error", "Please select a pickup person.");
        return;
      }

      if (!dropoffLocation) {
        Alert.alert("Error", "Please select a drop-off location.");
        return;
      }

      if (!dropoffLatitude || !dropoffLongitude) {
        Alert.alert("Error", "Location coordinates are missing. Please select a valid location.");
        return;
      }

      setLoading(true);

      // Get authentication token
      const authToken = await authStorage.getToken();
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const journeyData = {
        pickup_person_id: selectedPickupPerson.uuid,
        child_id: selectedChild.id,
        dropoff_location: dropoffLocation,
        dropoff_latitude: dropoffLatitude,
        dropoff_longitude: dropoffLongitude
      };

      console.log("📱 MOBILE APP - Create Journey Request:");
      console.log("📤 Selected Child:", selectedChild);
      console.log("📤 Selected Pickup Person:", selectedPickupPerson);
      console.log("📤 Dropoff Location:", dropoffLocation);
      console.log("📤 Dropoff Coordinates:", `${dropoffLatitude}, ${dropoffLongitude}`);
      console.log("📤 Full journey data:", JSON.stringify(journeyData, null, 2));

      const response = await apiClient.post("/api/create-journey", journeyData);

      console.log("📱 MOBILE APP - Create Journey Response:");
      console.log("📥 Response OK:", response.ok);
      console.log("📥 Response Data:", response.data);
      console.log("📥 Response Error:", response.error);

      if (response.ok) {
        const data = response.data;
        
        // Generate QR code URL for journey verification
        // Use the PHP web URL for verification (not the API URL)
        const baseUrl = "http://localhost:8888/KidMate";
        const verificationUrl = `${baseUrl}/verify.php?pickup_id=${data.pickup_id}`;
        
        setQrUrl(verificationUrl);
        setCreatedJourney({
          pickup_id: data.pickup_id,
          child_name: selectedChild.name,
          pickup_person_name: selectedPickupPerson.name
        });
        
        console.log("🎯 QR Code URL generated:", verificationUrl);
      } else {
        throw new Error(response.error || "Failed to create journey");
      }
    } catch (error) {
      console.log("Create journey error:", error);
      Alert.alert("Error", "Failed to create journey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelection = (child) => {
    setSelectedChild(child);
    setShowChildSelector(false);
  };

  const handlePickupPersonSelection = (pickupPerson) => {
    setSelectedPickupPerson(pickupPerson);
    setShowPickupPersonSelector(false);
  };

  const handleShare = async () => {
    try {
      if (!qrRef.current) return;

      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      if (Platform.OS === "ios" || Platform.OS === "android") {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          alert("Sharing not supported on this platform");
        }
      } else {
        await Share.share({
          url: uri,
          message: "Journey Verification QR Code",
        });
      }
    } catch (error) {
      console.log("Error sharing QR:", error);
      alert("Error sharing QR code");
    }
  };

  const handleReset = () => {
    setQrUrl(null);
    setCreatedJourney(null);
    setSelectedChild(null);
    setSelectedPickupPerson(null);
    setDropoffLocation("");
    setDropoffLocationName("");
    setDropoffLocationAddress("");
    setDropoffLatitude(null);
    setDropoffLongitude(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Journey</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {!qrUrl ? (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create New Pickup Journey</Text>
          
          <View style={styles.form}>
            {/* Child Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👶 Select Child</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowChildSelector(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedChild ? `${selectedChild.name} (ID: ${selectedChild.id})` : "Select Child"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pickup Person Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Select Pickup Person</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPickupPersonSelector(true)}
                disabled={loadingPickupPersons}
              >
                <Text style={styles.dropdownButtonText}>
                  {loadingPickupPersons ? "Loading..." : 
                   selectedPickupPerson ? `${selectedPickupPerson.name} (${selectedPickupPerson.kid_name})` : 
                   "Select Pickup Person"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Drop-off Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Drop-off Location</Text>
              <Text style={styles.sectionSubtitle}>Search and select where the child should be dropped off</Text>
              <GooglePlacesInput
                placeholder="Search for drop-off location (e.g., school, home, restaurant)..."
                onLocationSelect={handleDropoffLocationSelect}
                containerStyle={styles.googlePlacesContainer}
                textInputStyle={styles.googlePlacesInput}
              />
              {dropoffLocation && (
                <View style={styles.selectedLocation}>
                  <Text style={styles.selectedLocationText}>
                    ✅ Selected Location
                  </Text>
                  {dropoffLocationName && (
                    <Text style={styles.locationNameText}>
                      🏢 {dropoffLocationName}
                    </Text>
                  )}
                  <Text style={styles.locationAddressText}>
                    📍 {dropoffLocationAddress}
                  </Text>
                  {dropoffLatitude && dropoffLongitude && (
                    <Text style={styles.coordinatesText}>
                      📊 Coordinates: {dropoffLatitude.toFixed(6)}, {dropoffLongitude.toFixed(6)}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Create Journey Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleCreateJourney}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {loading ? "Creating Journey..." : "Create Journey"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.qrSection}>
          <Text style={styles.subtitle}>🎯 Journey Verification QR Code</Text>
          <Text style={styles.qrDescription}>
            Scan this QR code to verify the journey details and access admin verification.
          </Text>
          
          <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
            <QRCode value={qrUrl} size={250} />
          </View>
          
          <Text style={styles.qrText}>{qrUrl}</Text>
          
          {createdJourney && (
            <View style={styles.journeyInfo}>
              <Text style={styles.journeyInfoTitle}>Journey Details:</Text>
              <Text style={styles.journeyInfoText}>Child: {createdJourney.child_name}</Text>
              <Text style={styles.journeyInfoText}>Pickup Person: {createdJourney.pickup_person_name}</Text>
              <Text style={styles.journeyInfoText}>Pickup ID: {createdJourney.pickup_id}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Create New Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.share]}
            onPress={handleShare}
          >
            <Text style={styles.buttonText}>Share QR Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.track]}
            onPress={() => navigation.navigate("StatusTracking", { 
              newJourney: createdJourney
            })}
          >
            <Text style={styles.buttonText}>Track Journey</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Child Selector Modal */}
      {showChildSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Child</Text>
            <ScrollView style={styles.childList}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childItem}
                  onPress={() => handleChildSelection(child)}
                >
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childDetails}>
                    Age: {child.age} • Grade: {child.grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowChildSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pickup Person Selector Modal */}
      {showPickupPersonSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Pickup Person</Text>
            <ScrollView style={styles.childList}>
              {pickupPersons.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.childItem}
                  onPress={() => handlePickupPersonSelection(person)}
                >
                  <Text style={styles.childName}>{person.name}</Text>
                  <Text style={styles.childDetails}>
                    Child: {person.kid_name} • ID: {person.pickup_id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPickupPersonSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  form: { 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  dropdownButtonText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 16,
  },
  googlePlacesContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  googlePlacesInput: {
    fontSize: 16,
    color: "#333",
  },
  selectedLocation: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  selectedLocationText: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: 'bold',
  },
  locationNameText: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: '600',
    marginTop: 5,
  },
  locationAddressText: {
    fontSize: 14,
    color: colors.medium,
    marginTop: 2,
  },
  coordinatesText: {
    fontSize: 12,
    color: colors.medium,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.medium,
    opacity: 0.6,
  },
  submitText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 20,
  },
  childList: {
    maxHeight: 300,
  },
  childItem: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  childDetails: {
    fontSize: 14,
    color: colors.medium,
  },
  cancelButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  // QR Code styles
  qrSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  qrDescription: {
    fontSize: 14,
    color: colors.medium,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 15,
  },
  qrText: {
    fontSize: 12,
    color: "#666",
    marginVertical: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  journeyInfo: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    width: "100%",
  },
  journeyInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
  },
  journeyInfoText: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 3,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  share: {
    backgroundColor: "#00b894",
  },
  track: {
    backgroundColor: colors.primary,
  },
}); 