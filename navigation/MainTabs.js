import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import MedicalInfoScreen from "../screens/MedicalInfoScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import HospitalsScreen from "../screens/HospitalsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0FA958",
        tabBarInactiveTintColor: "#7a8b7a",

        tabBarStyle: {
          height: 60,
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 8,
        },

        //  Move icons & labels slightly upward
        tabBarItemStyle: {
          paddingBottom: 6,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6,
        },

        tabBarIconStyle: {
          marginTop: -4,   //  pushes icons upward
        },

        tabBarIcon: ({ color }) => {
          let iconName = "";

          if (route.name === "Dashboard") iconName = "hospital-box";
          if (route.name === "MedicalInfo") iconName = "heart-pulse";
          if (route.name === "Emergency") iconName = "ambulance";
          if (route.name === "Reports") iconName = "hospital-building";

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MedicalInfo" component={MedicalInfoScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      <Tab.Screen name="Reports" component={HospitalsScreen} />
    </Tab.Navigator>
  );
}
