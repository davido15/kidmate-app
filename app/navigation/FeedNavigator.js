import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import AttendanceListScreen from "../screens/AttendanceListScreen";
import GradesListScreen from "../screens/GradesListScreen";
import ComplaintsListScreen from "../screens/ComplaintsListScreen";

import routes from "./routes";


const Stack = createStackNavigator();

const FeedNavigator = () => (
  <Stack.Navigator mode="modal" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyTasks" component={HomeScreen} />
            <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
        <Stack.Screen name="GradesList" component={GradesListScreen} />
        <Stack.Screen name="ComplaintsList" component={ComplaintsListScreen} />
  </Stack.Navigator>
);

export default FeedNavigator;
