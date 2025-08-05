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
import colors from "../config/colors";
import { getChildren } from "../api/children";
import apiClient from "../api/client";
import authStorage from "../auth/storage";

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
      const response = await fetch("https://5d4c3ae2bc3e.ngrok-free.app/api/assign-pickup", {
        method: "POST",
        headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setQrUrl(data.pickup_url);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
        <Text style={styles.headerTitle}>Add Pickup Person</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("PickupPersonsList")}
        >
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>

      {!qrUrl ? (
        <>
          <Text style={styles.title}>Upload Pickup Person Details</Text>
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

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>
                {image ? "Change Image" : "Pick Image from Gallery"}
              </Text>
            </TouchableOpacity>

            {image && (
              <Image source={{ uri: image.uri }} style={styles.image} />
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
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
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  form: { marginBottom: 20 },
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
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
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
    paddingVertical: 15,
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
