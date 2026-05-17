// Import React and useState hook for managing component state
import React, { useState } from "react";

// SafeAreaView prevents UI from overlapping device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Import required React Native UI components
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

// Custom button component used across the app
import CustomButton from "../components/CustomButton";

// Popup component used to display success, warning, or error messages
import SuccessPopup from "../components/SuccessPopup";

// Supabase client used for authentication and database operations
import { supabase } from "../config/supabase";

// Registration screen component
export default function RegisterScreen({ navigation }) {

  // State variables for storing user input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Popup state variables for feedback messages
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Function to handle user registration
  const registerUser = async () => {

    // Validate that all fields are filled
    if (!name || !email || !password) {
      setPopupText("Please fill all fields");
      setPopupType("warning");
      setShowPopup(true);
      return;
    }

    // Create a new user account using Supabase authentication
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    // Handle registration error
    if (error) {
      setPopupText(error.message || "Registration failed");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    // Extract user ID from returned authentication data
    const userId = data?.user?.id;

    // Insert user profile information into the "users" table
    if (userId) {
      await supabase.from("users").insert({
        id: userId,
        name: name,
        email: email,
      });
    }

    // Show success popup when account creation is complete
    setPopupText("Account created successfully");
    setPopupType("success");
    setShowPopup(true);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Configure status bar appearance */}
      <StatusBar backgroundColor="#0FA958" barStyle="light-content" />

      {/* Popup for displaying feedback messages */}
      <SuccessPopup
        visible={showPopup}
        text={popupText}
        type={popupType}
        onHide={() => setShowPopup(false)}
      />

      {/* Top green header background */}
      <View style={styles.top} />

      {/* Registration form card */}
      <View style={styles.card}>

        {/* Screen title */}
        <Text style={styles.title}>Create Account</Text>

        {/* Input field for full name */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#6B7280"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Input field for email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Input field for password */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {/* Register button */}
        <CustomButton title="Register" onPress={registerUser} />

        {/* Navigation link to login screen */}
        <TouchableOpacity
          style={{ marginTop: 14 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// Styles used in the registration screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FFF7",
  },

  // Top green background section
  top: {
    height: 120,
    backgroundColor: "#0FA958",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  // Main registration form container
  card: {
    marginTop: -60,
    marginHorizontal: 18,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    elevation: 6,
  },

  // Screen title styling
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B3D2E",
    marginBottom: 10,
  },

  // Input field styling
  input: {
    backgroundColor: "#F4F8F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#1B4332", // ensures typed text is dark in APK
  },

  // Link text styling for navigation
  linkText: {
    color: "#0A6F3C",
    textAlign: "center",
    fontFamily: "Montserrat_600SemiBold",
  },
});