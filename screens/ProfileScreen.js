// Import React hooks for managing state and lifecycle
import React, { useState, useCallback } from "react";

// Import required React Native UI components
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";

// SafeAreaView prevents UI overlap with device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Wrapper component used for consistent screen layout
import ScreenWrapper from "../components/ScreenWrapper";

// Header component used for displaying screen titles
import Header from "../components/Header";

// Hook used to run functions when the screen gains focus
import { useFocusEffect } from "@react-navigation/native";

// Supabase client used for authentication and database operations
import { supabase } from "../config/supabase";

// Screen that displays the user's profile information
export default function ProfileScreen({ navigation }) {

  // State to store user profile data
  const [userData, setUserData] = useState(null);

  // Controls loading indicator while profile data is being fetched
  const [loading, setLoading] = useState(true);

  // Function to fetch user information from Supabase
  const fetchUser = async () => {

    // Get the currently authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not found stop loading
    if (!user) {
      setLoading(false);
      return;
    }

    try {

      // Fetch user's name and email from the "users" table
      const { data, error } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", user.id)
        .single();

      // Store user data if query succeeds
      if (!error && data) setUserData(data);

    } catch (e) {

      // Log error if fetching profile fails
      console.log("Profile Fetch Error:", e);
    }

    // Disable loading spinner
    setLoading(false);
  };

  // Refresh profile information whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUser();
    }, [])
  );

  // Function to log out the user
  const handleLogout = async () => {
    console.log("User logged out");

    // Sign the user out from Supabase authentication
    await supabase.auth.signOut();
  };

  // Display loading spinner while user data is being fetched
  if (loading) {
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

        <SafeAreaView style={{ flex: 1 }}>
          <Header title="User Profile" />

          {/* Loading indicator */}
          <ActivityIndicator
            size="large"
            color="#0FA958"
            style={{ marginTop: 50 }}
          />
        </SafeAreaView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <Header title="User Profile" />

        {/* Card displaying profile information */}
        <View style={styles.card}>

          {/* User name */}
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {userData?.name || "Not Set"}
          </Text>

          {/* User email */}
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>
            {userData?.email || "Not Set"}
          </Text>

          {/* Button to navigate to Edit Profile screen */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

// Styles used in this screen
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    margin: 16,
    elevation: 6,
  },

  label: {
    fontSize: 14,
    color: "#556e58",
    fontFamily: "Montserrat_400Regular",
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#0B3D2E",
  },

  editBtn: {
    backgroundColor: "#0FA958",
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
  },

  editText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },

  logoutBtn: {
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
});