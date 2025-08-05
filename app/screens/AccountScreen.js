import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";

import Screen from "../components/Screen";
import ListItem from "../components/ListItem";
import Icon from "../components/Icon";
import colors from "../config/colors";
import useAuth from "../auth/useAuth";
import routes from "../navigation/routes";
import apiClient from "../api/client";

function InfoCard({ label, value, backgroundColor, iconName }) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Icon name={iconName} backgroundColor="rgba(255,255,255,0.3)" size={30} />
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <Text style={styles.cardValue}>{value || "N/A"}</Text>
    </View>
  );
}

function AccountScreen({ navigation }) {
  const { user, logOut } = useAuth();
  const [userData, setUserData] = useState(null);
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract user info from decoded token
  const { sub } = user || {};
  const firstname = sub?.name || "N/A";
  const email = sub?.email || "N/A";
  const role = sub?.role || "N/A";

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/me');
      
      if (response.ok) {
        setUserData(response.data.user);
        setParentData(response.data.parent);
      } else {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', response.problem);
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => logOut();

  const handleNotificationsPress = () => {
    navigation.navigate(routes.MESSAGES);
  };

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading account information...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" backgroundColor={colors.danger} size={50} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userData?.name || firstname}</Text>
        <TouchableOpacity onPress={handleNotificationsPress} style={styles.iconButton}>
          <Icon name="email" backgroundColor={colors.secondary} size={28} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Cards */}
        <View style={styles.infoContainer}>
          <InfoCard
            label="Name"
            value={userData?.name || firstname}
            backgroundColor={colors.primary}
            iconName="account"
          />
          <InfoCard
            label="Email"
            value={userData?.email || email}
            backgroundColor={colors.secondary}
            iconName="email"
          />
          <InfoCard
            label="Phone"
            value={userData?.phone || "N/A"}
            backgroundColor={colors.primary}
            iconName="phone"
          />
          <InfoCard
            label="Role"
            value={userData?.role || role}
            backgroundColor={colors.secondary}
            iconName="account-check"
          />
        </View>

        {/* Parent Information Section */}
        {parentData && (
          <View style={styles.parentSection}>
            <Text style={styles.sectionTitle}>Parent Information</Text>
            <View style={styles.infoContainer}>
              <InfoCard
                label="Parent Name"
                value={parentData.name}
                backgroundColor="#4CAF50"
                iconName="account-multiple"
              />
              <InfoCard
                label="Phone"
                value={parentData.phone}
                backgroundColor="#2196F3"
                iconName="phone"
              />
              <InfoCard
                label="Address"
                value={parentData.address}
                backgroundColor="#FF9800"
                iconName="map-marker"
              />
              <InfoCard
                label="Occupation"
                value={parentData.occupation}
                backgroundColor="#9C27B0"
                iconName="briefcase"
              />
              <InfoCard
                label="Relationship"
                value={parentData.relationship}
                backgroundColor="#607D8B"
                iconName="heart"
              />
            </View>
          </View>
        )}

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <ListItem
            title="Log Out"
            IconComponent={<Icon name="logout" backgroundColor="#ff5252" />}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.light,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.light,
    elevation: 4,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  iconButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  infoContainer: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  cardValue: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  parentSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  logoutContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccountScreen;
