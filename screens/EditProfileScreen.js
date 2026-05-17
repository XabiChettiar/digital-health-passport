// Import React hooks for state management and lifecycle
import React, { useEffect, useState } from "react";

// SafeAreaView prevents UI from overlapping with device notches
import { SafeAreaView } from "react-native-safe-area-context";

// Import required React Native components
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";

// Custom wrapper component used for consistent screen layout
import ScreenWrapper from "../components/ScreenWrapper";

// Header component used to display the screen title
import Header from "../components/Header";

// Supabase client used for authentication and database operations
import { supabase } from "../config/supabase";

// Popup component used to display success, warning, or error messages
import SuccessPopup from "../components/SuccessPopup";

// Screen for editing user profile details
export default function EditProfileScreen({ navigation }) {

  // State variables to store user profile data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Controls loading indicator while fetching user data
  const [loading, setLoading] = useState(true);

  // Controls saving state while updating profile
  const [saving, setSaving] = useState(false);

  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Load user information when the screen first mounts
  useEffect(() => {
    const loadUser = async () => {

      // Get the currently authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If no authenticated user exists, stop loading
      if (!user) return;

      try {
        // Fetch user's name and email from the "users" table
        const { data, error } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", user.id)
          .single();

        // If data is successfully fetched, populate input fields
        if (!error && data) {
          setName(data.name);
          setEmail(data.email);
        }
      } catch (e) {
        // Log error if fetching fails
        console.log("Edit Profile Fetch Error:", e);
      }

      // Disable loading spinner after data is fetched
      setLoading(false);
    };

    loadUser();
  }, []);

  // Function to save updated profile information
  const saveChanges = async () => {

    // Validate that name field is not empty
    if (!name.trim()) {
      setPopupText("Name cannot be empty");
      setPopupType("warning");
      setShowPopup(true);
      return;
    }

    try {
      // Enable saving state
      setSaving(true);

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Update name and email in the "users" table
      const { error } = await supabase
        .from("users")
        .update({
          name,
          email,
        })
        .eq("id", user.id);

      // Throw error if update fails
      if (error) throw error;

      // Show success popup
      setPopupText("Profile updated successfully");
      setPopupType("success");
      setShowPopup(true);

      // Navigate back after short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (e) {

      // Show error popup if something goes wrong
      setPopupText("Something went wrong");
      setPopupType("error");
      setShowPopup(true);
    }

    // Disable saving state
    setSaving(false);
  };

  // Show loading indicator while profile data is being fetched
  if (loading) {
    return (
      <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
        <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Header title="Edit Profile" />

          {/* Loading spinner */}
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
        <Header title="Edit Profile" />

        {/* Popup used to display success or error messages */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        {/* Main card container for profile form */}
        <View style={styles.card}>

          {/* Name input field */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter Name"
            placeholderTextColor="#6B7280"
          />

          {/* Email input field */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Button used to save profile changes */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={saveChanges}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
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
    fontFamily: "Montserrat_600SemiBold",
    marginTop: 10,
    color: "#0B3D2E",
  },

  input: {
    backgroundColor: "#F4F8F5",
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    color: "#1B4332", // ensures typed text is dark
  },

  saveBtn: {
    backgroundColor: "#0FA958",
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
  },

  saveText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
});