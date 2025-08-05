import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import AttendanceListScreen from "../screens/AttendanceListScreen";
import GradesListScreen from "../screens/GradesListScreen";
import ComplaintsListScreen from "../screens/ComplaintsListScreen";
import PickupPersonsListScreen from "../screens/PickupPersonsListScreen";
import UploadPickupPerson from "../screens/UploadPickupPerson";
import routes from "./routes";


const Stack = createStackNavigator();

const FeedNavigator = () => (
  <Stack.Navigator mode="modal" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyTasks" component={HomeScreen} />
            <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
        <Stack.Screen name="GradesList" component={GradesListScreen} />
        <Stack.Screen name="ComplaintsList" component={ComplaintsListScreen} />
    <Stack.Screen name="PickupPersonsList" component={PickupPersonsListScreen} />
    <Stack.Screen name="UploadPickupPerson" component={UploadPickupPerson} />
  </Stack.Navigator>
);

export default FeedNavigator;
