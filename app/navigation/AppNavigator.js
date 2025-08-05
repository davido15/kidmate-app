import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AccountNavigator from "./AccountNavigator";
import FeedNavigator from "./FeedNavigator";
import HistoryNavigator from "./HistoryNavigator";

import PaymentScreen from "../screens/PaymentScreen";
import UploadPickupPerson from "../screens/UploadPickupPerson";
import StatusTrackingScreen from "../screens/StatusTrackingScreen";
import PickupPersonsListScreen from "../screens/PickupPersonsListScreen"; // Added


const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <Tab.Navigator>
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
      component={UploadPickupPerson}
      options={({ navigation }) => ({
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="plus-outline"
            color={color}
            size={size}
          />
        ),
      })}
    />
    <Tab.Screen
      name="Track"
      component={StatusTrackingScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="progress-clock" color={color} size={size} />
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
    <Tab.Screen
      name="PickupPersonsList"
      component={PickupPersonsListScreen}
      options={{
        tabBarButton: () => null, // Hide from tab bar
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="list" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AppNavigator;
