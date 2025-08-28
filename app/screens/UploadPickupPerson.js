import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Share,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import Constants from "expo-constants";
import colors from "../config/colors";
import { getChildren } from "../api/children";
import apiClient from "../api/client";
import authStorage from "../auth/storage";
import GooglePlacesInput from "../components/GooglePlacesInput";

const PickupManagerScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [pickupId, setPickupId] = useState("");
  const [kidId, setKidId] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  
  // State for drop-off location
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffLocationName, setDropoffLocationName] = useState("");
  const [dropoffLocationAddress, setDropoffLocationAddress] = useState("");
  const [dropoffLatitude, setDropoffLatitude] = useState(null);
  const [dropoffLongitude, setDropoffLongitude] = useState(null);

  // Add header with back button (only show if not the initial screen)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Add Pickup Person",
      headerLeft: () => null, // No back button since this is the initial screen
    });
  }, [navigation]);

  const qrRef = useRef();

  // Fetch children for the authenticated parent
  const fetchChildren = async () => {
    try {
      const response = await getChildren();
      if (response.ok && response.data && response.data.children) {
        setChildren(response.data.children);
        console.log("✅ Children fetched:", response.data.children);
      } else {
        console.log("❌ Failed to fetch children:", response);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  // Fetch children on component mount
  useEffect(() => {
    fetchChildren();
  }, []);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert("Permission to access gallery is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      console.log("Error picking image:", err);
      alert("Error selecting image.");
    }
  };

  const handleDropoffLocationSelect = (locationData) => {
    // Store both the display text and the structured data
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
    
    // Show warning if coordinates are missing
    if (!locationData.latitude || !locationData.longitude) {
      console.warn("⚠️ Warning: Location coordinates are missing for:", locationData.description);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!image) {
        Alert.alert("Error", "Please select an image before submitting.");
        return;
      }

      if (!selectedChild) {
        Alert.alert("Error", "Please select a child before submitting.");
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
      const formData = new FormData();

      formData.append("name", name);
      formData.append("pickup_id", pickupId);
      formData.append("kid_id", selectedChild.id);
      formData.append("phone", phone);
      formData.append("dropoff_location", dropoffLocation);
      formData.append("dropoff_latitude", dropoffLatitude.toString());
      formData.append("dropoff_longitude", dropoffLongitude.toString());
      
      console.log("📤 Sending to backend:", {
        name,
        pickup_id: pickupId,
        kid_id: selectedChild.id,
        phone,
        dropoff_location: dropoffLocation,
        dropoff_latitude: dropoffLatitude,
        dropoff_longitude: dropoffLongitude
      });
      formData.append("image", {
        uri: image.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      // Get authentication token
      const authToken = await authStorage.getToken();
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Use the API client for proper authentication
      const response = await apiClient.post("/api/assign-pickup", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.ok) {
        const data = response.data;
        setQrUrl(data.pickup_url);
      } else {
        throw new Error(response.error || "Failed to assign pickup");
      }
    } catch (error) {
      console.log("Submit error:", error);
      Alert.alert("Error", "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setPickupId("");
    setKidId("");
    setPhone("");
    setImage(null);
    setQrUrl(null);
    setSelectedChild(null);
    setShowChildSelector(false);
    setDropoffLocation("");
    setDropoffLocationName("");
    setDropoffLocationAddress("");
    setDropoffLatitude(null);
    setDropoffLongitude(null);
  };

  const handleChildSelection = (child) => {
    setSelectedChild(child);
    setKidId(child.id.toString());
    setShowChildSelector(false);
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
          message: "Pickup QR code",
        });
      }
    } catch (error) {
      console.log("Error sharing QR:", error);
      alert("Error sharing QR code");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Journey</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("PickupPersonsList")}
        >
          <Text style={styles.viewAllButtonText}>View All</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Pickup ID"
              value={pickupId}
              onChangeText={setPickupId}
            />
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowChildSelector(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedChild ? `${selectedChild.name} (ID: ${selectedChild.id})` : "Select Child"}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Drop-off Location Section */}
            <View style={styles.locationSection}>
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

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>
                {image ? "Change Image" : "Pick Image from Gallery"}
              </Text>
            </TouchableOpacity>

            {image && (
              <Image source={{ uri: image.uri }} style={styles.image} />
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {loading ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.qrSection}>
          <Text style={styles.subtitle}>QR Code for Pickup</Text>
          <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
            <QRCode value={qrUrl} size={200} />
          </View>
          <Text style={styles.qrText}>{qrUrl}</Text>

          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Update Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.share]}
            onPress={handleShare}
          >
            <Text style={styles.buttonText}>Share QR Code</Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add extra padding at bottom for submit button
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  form: { 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  imagePicker: {
    backgroundColor: "#ddd",
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  imagePickerText: {
    color: "#000",
    fontWeight: "500",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginTop: 10,
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
  qrSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  qrText: {
    fontSize: 12,
    color: "#666",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  share: {
    backgroundColor: "#00b894",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  dropdownButtonText: {
    color: "#333",
    fontWeight: "500",
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
    borderWidth: 1,
    borderColor: colors.medium,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Constants.statusBarHeight + 10,
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
  viewAllButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewAllButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  locationSection: {
    marginTop: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 10,
    fontStyle: 'italic',
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
  coordinatesText: {
    fontSize: 12,
    color: colors.medium,
    marginTop: 5,
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
});

export default PickupManagerScreen;
