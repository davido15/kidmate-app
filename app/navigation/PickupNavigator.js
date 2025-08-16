import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import PickupPersonsListScreen from "../screens/PickupPersonsListScreen";
import UploadPickupPerson from "../screens/UploadPickupPerson";
import routes from "./routes";

const Stack = createStackNavigator();

const PickupNavigator = () => (
  <Stack.Navigator mode="modal" screenOptions={{ headerShown: true }}>
    <Stack.Screen 
      name="UploadPickupPerson" 
      component={UploadPickupPerson}
      options={{ headerTitle: "Add Pickup Person" }}
    />
    <Stack.Screen 
      name="PickupPersonsList" 
      component={PickupPersonsListScreen}
      options={{ headerTitle: "Pickup Persons" }}
    />
  </Stack.Navigator>
);

export default PickupNavigator; 