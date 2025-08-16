import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";

import Screen from "../components/Screen";
import ListItem from "../components/ListItem";
import Icon from "../components/Icon";
import colors from "../config/colors";
import useAuth from "../auth/useAuth";
import routes from "../navigation/routes";
import apiClient from "../api/client";

function InfoCard({ title, items, backgroundColor, iconName }) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Icon name={iconName} backgroundColor="rgba(255,255,255,0.3)" size={30} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.cardItem}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value || "N/A"}</Text>
          </View>
        ))}
      </View>
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

  const handleProfilePress = () => {
    navigation.navigate(routes.PROFILE);
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
        {/* User Profile Card */}
        <InfoCard
          title="Profile Information"
          items={[
            { label: "Name", value: userData?.name || firstname },
            { label: "Email", value: userData?.email || email },
            { label: "Phone", value: userData?.phone || "N/A" },
            { label: "Role", value: userData?.role || role }
          ]}
          backgroundColor={colors.primary}
          iconName="account"
        />

        {/* Parent Information Card */}
        {parentData && (
          <InfoCard
            title="Parent Details"
            items={[
              { label: "Name", value: parentData.name },
              { label: "Phone", value: parentData.phone },
              { label: "Address", value: parentData.address },
              { label: "Occupation", value: parentData.occupation },
              { label: "Relationship", value: parentData.relationship }
            ]}
            backgroundColor={colors.secondary}
            iconName="account-multiple"
          />
        )}



        {/* Logout */}
        <View style={styles.logoutContainer}>
          <ListItem
            title="Log Out"
            subTitle="Sign out of your account"
            IconComponent={<Icon name="logout" backgroundColor="#ff5252" />}
            onPress={handleLogout}
            style={styles.logoutItem}
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
  card: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
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
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  cardContent: {
    gap: 12,
  },
  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  actionsContainer: {
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
    marginTop: 30,
    marginHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutItem: {
    borderBottomWidth: 0,
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
