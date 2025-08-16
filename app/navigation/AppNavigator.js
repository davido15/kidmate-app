import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AccountNavigator from "./AccountNavigator";
import FeedNavigator from "./FeedNavigator";
import HistoryNavigator from "./HistoryNavigator";
import PickupNavigator from "./PickupNavigator";
import TrackNavigator from "./TrackNavigator";

import PaymentScreen from "../screens/PaymentScreen";
import TestGooglePlacesScreen from "../screens/TestGooglePlacesScreen";

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#2F3B52",
      tabBarInactiveTintColor: "#666",
      tabBarStyle: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingBottom: 2,
        paddingTop: 2,
        height: 50,
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        marginHorizontal: 10,
        borderRadius: 15,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "500",
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={FeedNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Payments"
      component={PaymentScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="credit-card"
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Add Picker"
      component={PickupNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="plus-outline"
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Track"
      component={TrackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="progress-clock" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Test Places"
      component={TestGooglePlacesScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="map-marker" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="history" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Account"
      component={AccountNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;
