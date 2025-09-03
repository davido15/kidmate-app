import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import Constants from "expo-constants";
import colors from "../config/colors";
import { getChildren } from "../api/children";
import apiClient from "../api/client";
import authStorage from "../auth/storage";

import AppTextInput from "../components/AppTextInput";

const PickupManagerScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [pickupId, setPickupId] = useState("");

  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  


  // Add header with back button (only show if not the initial screen)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Add Pickup Person",
      headerLeft: () => null, // No back button since this is the initial screen
    });
  }, [navigation]);



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



      setLoading(true);
      const formData = new FormData();

      formData.append("name", name);
      formData.append("pickup_id", pickupId);
      formData.append("kid_id", selectedChild.id);
      formData.append("phone", phone);

      
      console.log("📤 Sending to backend:", {
        name,
        pickup_id: pickupId,
        kid_id: selectedChild.id,
        phone
      });
      formData.append("image", {
        uri: image.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      // Use the API client for proper authentication
      const response = await apiClient.post("/api/assign-pickup", formData);

      if (response.ok) {
        // Show success message and navigate to pickup persons list
        Alert.alert(
          "Success", 
          "Pickup person added successfully!", 
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("PickupPersonsList")
            }
          ]
        );
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

    setPhone("");
    setImage(null);
    setSelectedChild(null);
    setShowChildSelector(false);
  };

  const handleChildSelection = (child) => {
    setSelectedChild(child);

    setShowChildSelector(false);
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Pickup Person</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("PickupPersonsList")}
        >
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>


        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.form}>
            <Text style={styles.label}>👤 Full Name</Text>
            <AppTextInput
              icon="account"
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>🆔 Ghana Card</Text>
            <AppTextInput
              icon="card-account-details"
              placeholder="Enter Ghana Card number"
              value={pickupId}
              onChangeText={setPickupId}
            />
            <Text style={styles.label}>👶 Select Child</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowChildSelector(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedChild ? `${selectedChild.name} (ID: ${selectedChild.id})` : "Select Child"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>📱 Phone Number</Text>
            <AppTextInput
              icon="phone"
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />



            <Text style={styles.label}>📷 Profile Image</Text>
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
    color: "#333",
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

});

export default PickupManagerScreen;
