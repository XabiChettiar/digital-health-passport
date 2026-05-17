// Import React and the useState hook for managing component state
import React, { useState } from "react";

// Import required React Native UI components
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from "react-native";

// SafeAreaView prevents UI overlap with device notches and system UI
import { SafeAreaView } from "react-native-safe-area-context";

// Custom wrapper component used for consistent screen layout
import ScreenWrapper from "../components/ScreenWrapper";

// Custom header component for displaying the screen title
import Header from "../components/Header";

// Supabase client used for database and authentication
import { supabase } from "../config/supabase";

// Popup component used to show success, warning, or error messages
import SuccessPopup from "../components/SuccessPopup";

// Main screen component for adding a hospital
export default function AddHospitalScreen({ navigation }) {

  // State to store hospital name entered by the user
  const [name, setName] = useState("");

  // State to indicate when the hospital is being saved
  const [saving, setSaving] = useState(false);

  // States for controlling popup messages
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupType, setPopupType] = useState("success");

  // Function to save hospital data to Supabase
  const saveHospital = async () => {

    // Validate hospital name
    if (!name.trim()) {
      setPopupText("Hospital name is required");
      setPopupType("warning");
      setShowPopup(true);
      return;
    }

    // Enable saving state to prevent multiple button presses
    setSaving(true);

    // Get the currently logged-in user from Supabase authentication
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    // If no user is found, show error
    if (!user) {
      setPopupText("User not found. Please login again.");
      setPopupType("error");
      setShowPopup(true);
      setSaving(false);
      return;
    }

    try {
      // Insert hospital record into the "hospitals" table
      const { error } = await supabase.from("hospitals").insert({
        user_id: user.id,
        name: name,
      });

      // Throw error if insertion fails
      if (error) throw error;

      // Show success popup
      setPopupText("Hospital added successfully");
      setPopupType("success");
      setShowPopup(true);

      // Navigate back after short delay
      setTimeout(() => navigation.goBack(), 1200);

    } catch (e) {
      // Log error for debugging
      console.log(e);

      // Show error popup
      setPopupText("Failed to add hospital");
      setPopupType("error");
      setShowPopup(true);
    }

    // Disable saving state
    setSaving(false);
  };

  return (
    <ScreenWrapper style={{ backgroundColor: "#F6FFF7" }}>
      {/* Configure status bar */}
      <StatusBar backgroundColor="#F6FFF7" barStyle="dark-content" />

      {/* Safe area container */}
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>

        {/* Header displaying screen title */}
        <Header title="Add Hospital" />

        {/* Popup for feedback messages */}
        <SuccessPopup
          visible={showPopup}
          text={popupText}
          type={popupType}
          onHide={() => setShowPopup(false)}
        />

        {/* Main content */}
        <View style={{ padding: 20 }}>

          {/* Hospital icon container */}
          <View style={styles.iconBox}>
            <Text style={[styles.icon, { color: "#0FA958" }]}>🏥</Text>
          </View>

          {/* Input field for hospital name */}
          <TextInput
            style={styles.input}
            placeholder="Hospital Name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />

          {/* Button to save hospital */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={saveHospital}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save Hospital"}
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

// Styles for the screen
const styles = StyleSheet.create({

  // Circular container for the hospital icon
  iconBox: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: "#eaf7ea",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  // Icon styling
  icon: {
    fontSize: 45,
  },

  // Input field styling
  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#1B4332", // ensures typed text is dark
  },

  // Save button styling
  saveBtn: {
    backgroundColor: "#0FA958",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  // Save button text styling
  saveText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
});