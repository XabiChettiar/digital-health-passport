import React, { useCallback, useState, useEffect } from "react";
import { StatusBar, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainTabs from "./navigation/MainTabs";
import EditMedicalInfoScreen from "./screens/EditMedicalInfoScreen";
import AddHospitalScreen from "./screens/AddHospitalScreen";
import UploadReportsScreen from "./screens/UploadReportsScreen";
import MedicationsScreen from "./screens/MedicationsScreen";
import AddMedicationScreen from "./screens/AddMedicationScreen";
import EditMedicationScreen from "./screens/EditMedicationScreen";

import { supabase } from "./config/supabase";

// Custom navigation theme with app background color
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F6FFF7",
  },
};

// Prevent splash screen from auto hiding until app is ready
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator(); // Create stack navigator

export default function App() {
  // Load Montserrat fonts before rendering app
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const [session, setSession] = useState(null); // Stores current Supabase session
  const [checkingAuth, setCheckingAuth] = useState(true); // Tracks authentication check status

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Get existing user session from Supabase
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setSession(data?.session ?? null); // Set session if exists
        setCheckingAuth(false); // Mark auth check as complete
      }
    };

    initAuth();

    // Listen for login/logout state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session); // Update session on auth change
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe(); // Clean up auth listener
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // Hide splash screen only after fonts and auth check complete
    if (fontsLoaded && !checkingAuth) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, checkingAuth]);

  // Prevent rendering until fonts and authentication are ready
  if (!fontsLoaded || checkingAuth) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      {/* Root container with app background */}
      <View style={{ flex: 1, backgroundColor: "#F6FFF7" }}>
        <NavigationContainer theme={MyTheme}>
          {/* Status bar styling */}
          <StatusBar
            backgroundColor="#F6FFF7"
            barStyle="dark-content"
          />

          {/* Stack navigator for screen routing */}
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
              // Screens accessible when user is logged in
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="EditMedicalInfo" component={EditMedicalInfoScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="AddHospital" component={AddHospitalScreen} />
                <Stack.Screen name="UploadReports" component={UploadReportsScreen} />
                <Stack.Screen name="Medications" component={MedicationsScreen} />
                <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
                <Stack.Screen
                  name="EditMedication"
                  component={EditMedicationScreen}
                  initialParams={{ medicationId: null }} // Default parameter for editing medication
                />
              </>
            ) : (
              // Screens accessible when user is not logged in
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
