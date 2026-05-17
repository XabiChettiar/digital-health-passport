// Import React and useState hook for managing component state
import React, { useState } from "react";

// SafeAreaView prevents UI overlap with device notches and system bars
import { SafeAreaView } from "react-native-safe-area-context";

// Import required React Native components
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

// Custom button component used for consistent button styling
import CustomButton from "../components/CustomButton";

// Supabase client used for authentication and database operations
import { supabase } from "../config/supabase";

// Popup component used to display success, warning, or error messages
import SuccessPopup from "../components/SuccessPopup";

// Login screen component
export default function LoginScreen({ navigation }) {

  // State variables for storing email and password input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Function to handle user login
  const loginUser = async () => {
    console.log("Login attempt started");

    // Validate that email and password are provided
    if (!email || !password) {
      console.log("Validation failed: Missing email or password");
      setPopupText("Please enter email and password");
      setPopupType("warning");
      setShowPopup(true);
      return;
    }

    // Attempt login using Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle login error
    if (error) {
      console.log("Login failed:", error.message);
      setPopupText(error.message || "Login failed");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    console.log("Login successful");

    // Ensure user profile exists in the database
    await ensureUserProfile(data.user);

    // Navigate to the main application tabs after successful login
    console.log("Navigating to MainTabs");
    navigation.replace("MainTabs");
  };

  // Function to ensure the user has a profile record in the "users" table
  const ensureUserProfile = async (user) => {

    // Check if the user profile already exists
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // If profile does not exist, create a new one
    if (!profile) {
      await supabase.from("users").insert({
        id: user.id,
        name: user.user_metadata?.full_name || "User",
        email: user.email,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Configure status bar appearance */}
      <StatusBar backgroundColor="#0FA958" barStyle="light-content" />

      {/* Popup component for displaying login errors or warnings */}
      <SuccessPopup
        visible={showPopup}
        text={popupText}
        type={popupType}
        onHide={() => setShowPopup(false)}
      />

      {/* Top green background section */}
      <View style={styles.top} />

      {/* Login form card */}
      <View style={styles.card}>

        {/* Screen title */}
        <Text style={styles.title}>Welcome Back</Text>

        {/* Subtitle description */}
        <Text style={styles.sub}>
          Login to your Digital Health Passport
        </Text>

        {/* Email input field */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password input field */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {/* Login button */}
        <CustomButton title="Log in" onPress={loginUser} />

        {/* Link to navigate to the registration screen */}
        <TouchableOpacity
          style={{ marginTop: 14 }}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.linkText}>
            Don't have an account? Create one
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// Styles used in the login screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FFF7",
  },

  // Top green header background
  top: {
    height: 120,
    backgroundColor: "#0FA958",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  // Main login card container
  card: {
    marginTop: -60,
    marginHorizontal: 18,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    elevation: 6,
  },

  // Title text style
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0B3D2E",
    marginBottom: 6,
  },

  // Subtitle text style
  sub: {
    color: "#556e58",
    marginBottom: 12,
  },

  // Input field styling
  input: {
    backgroundColor: "#F4F8F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#1B4332",
  },

  // Link text style for navigation to register screen
  linkText: {
    color: "#0A6F3C",
    textAlign: "center",
    fontWeight: "600",
  },
});