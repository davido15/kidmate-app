import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import PickupHistoryScreen from "../screens/PickupHistoryScreen";
import JourneyDetailScreen from "../screens/JourneyDetailScreen";

const Stack = createStackNavigator();

const HistoryNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="PickupHistory"
      component={PickupHistoryScreen}
      options={{
        title: "Pickup History",
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="JourneyDetail"
      component={JourneyDetailScreen}
      options={{
        title: "Journey Details",
        headerStyle: {
          backgroundColor: "#2F3B52",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
  </Stack.Navigator>
);

export default HistoryNavigator; 