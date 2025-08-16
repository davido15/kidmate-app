import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import StatusTrackingScreen from "../screens/StatusTrackingScreen";
import CreateJourneyScreen from "../screens/CreateJourneyScreen";

const Stack = createStackNavigator();

const TrackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="StatusTracking" component={StatusTrackingScreen} />
    <Stack.Screen name="CreateJourney" component={CreateJourneyScreen} />
  </Stack.Navigator>
);

export default TrackNavigator; 